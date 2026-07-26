import uuid

import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.core.config import settings
from app.models.campaign import Campaign
from app.models.donation import Donation, DonationFrequency, DonationStatus
from app.models.user import User
from app.schemas.donation import (
    DonationConfirmRequest,
    DonationConfirmResponse,
    DonationRead,
    LegResult,
    SetupIntentResponse,
)

router = APIRouter()

FEE_PERCENT = 0.029
FEE_FIXED_CENTS = 30


def _compute_fee_cents(subtotal_cents: int) -> int:
    return round(subtotal_cents * FEE_PERCENT) + FEE_FIXED_CENTS


@router.post("/setup-intent", response_model=SetupIntentResponse)
async def create_setup_intent() -> SetupIntentResponse:
    """Creates a bare Stripe Customer + SetupIntent so the embedded Payment
    Element can mount immediately on page load. Donor name/email/billing
    details are attached to the PaymentMethod at confirm time (client-side)
    and stored on our own Donation rows — they don't need to live on the
    Customer object for this flow.
    """
    stripe.api_key = settings.stripe_secret_key
    customer = await stripe.Customer.create_async()
    setup_intent = await stripe.SetupIntent.create_async(
        customer=customer.id,
        payment_method_types=["card"],
        usage="off_session",
    )
    return SetupIntentResponse(customer_id=customer.id, client_secret=setup_intent.client_secret)


@router.post("/confirm", response_model=DonationConfirmResponse)
async def confirm_basket(
    payload: DonationConfirmRequest,
    db: AsyncSession = Depends(get_db),
) -> DonationConfirmResponse:
    stripe.api_key = settings.stripe_secret_key

    campaign_ids = {item.campaign_id for item in payload.items}
    campaigns = {
        c.id: c
        for c in (await db.scalars(select(Campaign).where(Campaign.id.in_(campaign_ids)))).all()
    }
    missing = campaign_ids - campaigns.keys()
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="One or more campaigns not found."
        )

    one_time_items = [i for i in payload.items if i.frequency == DonationFrequency.ONE_TIME]
    monthly_items = [i for i in payload.items if i.frequency == DonationFrequency.MONTHLY]
    billing_dict = payload.billing.model_dump()

    # The "cover card fee" checkbox applies once per basket, folded into
    # whichever leg is charged first (one-time preferred).
    remaining_fee_cents = (
        _compute_fee_cents(sum(i.amount_cents for i in payload.items)) if payload.cover_fee else 0
    )

    def make_donation(
        campaign_id: uuid.UUID | None,
        amount_cents: int,
        frequency: DonationFrequency,
        is_fee: bool = False,
    ) -> Donation:
        return Donation(
            campaign_id=campaign_id,
            donor_name=payload.donor_name,
            donor_email=payload.donor_email,
            donor_phone=payload.donor_phone,
            dedication=payload.dedication,
            billing_details=billing_dict,
            amount_cents=amount_cents,
            frequency=frequency,
            status=DonationStatus.PENDING,
            is_fee=is_fee,
            stripe_customer_id=payload.customer_id,
        )

    legs: list[LegResult] = []

    if one_time_items:
        donations = [
            make_donation(i.campaign_id, i.amount_cents, DonationFrequency.ONE_TIME)
            for i in one_time_items
        ]
        total_cents = sum(i.amount_cents for i in one_time_items)

        if remaining_fee_cents:
            donations.append(
                make_donation(None, remaining_fee_cents, DonationFrequency.ONE_TIME, is_fee=True)
            )
            total_cents += remaining_fee_cents
            remaining_fee_cents = 0

        db.add_all(donations)
        await db.flush()
        donation_ids = [d.id for d in donations]

        try:
            pi = await stripe.PaymentIntent.create_async(
                amount=total_cents,
                currency="usd",
                customer=payload.customer_id,
                payment_method=payload.payment_method_id,
                payment_method_types=["card"],
                confirm=True,
                off_session=False,
                metadata={"donation_ids": ",".join(str(i) for i in donation_ids)},
            )
        except stripe.CardError as exc:
            for d in donations:
                d.status = DonationStatus.FAILED
            await db.commit()
            legs.append(
                LegResult(
                    frequency=DonationFrequency.ONE_TIME,
                    status="failed",
                    message=exc.user_message or "The card was declined.",
                    donation_ids=donation_ids,
                )
            )
        else:
            for d in donations:
                d.stripe_payment_intent_id = pi.id
            await db.commit()
            legs.append(_leg_result_from_intent(DonationFrequency.ONE_TIME, pi, donation_ids))

    if monthly_items:
        donations = [
            make_donation(i.campaign_id, i.amount_cents, DonationFrequency.MONTHLY)
            for i in monthly_items
        ]
        subscription_items = []
        for item in monthly_items:
            product = await stripe.Product.create_async(
                name=f"Monthly donation — {campaigns[item.campaign_id].title}"
            )
            subscription_items.append(
                {
                    "price_data": {
                        "currency": "usd",
                        "product": product.id,
                        "unit_amount": item.amount_cents,
                        "recurring": {"interval": "month"},
                    },
                    "quantity": 1,
                }
            )

        add_invoice_items = []
        if remaining_fee_cents:
            donations.append(
                make_donation(None, remaining_fee_cents, DonationFrequency.ONE_TIME, is_fee=True)
            )
            fee_product = await stripe.Product.create_async(name="Processing fee")
            add_invoice_items.append(
                {
                    "price_data": {
                        "currency": "usd",
                        "product": fee_product.id,
                        "unit_amount": remaining_fee_cents,
                    },
                }
            )
            remaining_fee_cents = 0

        db.add_all(donations)
        await db.flush()
        donation_ids = [d.id for d in donations]

        try:
            sub = await stripe.Subscription.create_async(
                customer=payload.customer_id,
                items=subscription_items,
                add_invoice_items=add_invoice_items or None,
                default_payment_method=payload.payment_method_id,
                payment_behavior="default_incomplete",
                expand=["latest_invoice.confirmation_secret"],
                metadata={"donation_ids": ",".join(str(i) for i in donation_ids)},
            )
        except stripe.CardError as exc:
            for d in donations:
                d.status = DonationStatus.FAILED
            await db.commit()
            legs.append(
                LegResult(
                    frequency=DonationFrequency.MONTHLY,
                    status="failed",
                    message=exc.user_message or "The card was declined.",
                    donation_ids=donation_ids,
                )
            )
        else:
            for d in donations:
                d.stripe_subscription_id = sub.id
            await db.commit()

            # As of the "Basil" API version, Invoice.payment_intent no longer
            # exists (invoices can have multiple partial payments now) — the
            # PaymentIntent is reached via confirmation_secret.client_secret
            # instead. See: https://docs.stripe.com/changelog/basil/2025-03-31/add-support-for-multiple-partial-payments-on-invoices
            pi_id = sub.latest_invoice.confirmation_secret.client_secret.split("_secret_")[0]
            pi = await stripe.PaymentIntent.retrieve_async(pi_id)
            if pi.status == "requires_confirmation":
                try:
                    pi = await stripe.PaymentIntent.confirm_async(pi.id)
                except stripe.CardError as exc:
                    for d in donations:
                        d.status = DonationStatus.FAILED
                    await db.commit()
                    legs.append(
                        LegResult(
                            frequency=DonationFrequency.MONTHLY,
                            status="failed",
                            message=exc.user_message or "The card was declined.",
                            donation_ids=donation_ids,
                        )
                    )
                    pi = None

            if pi is not None:
                for d in donations:
                    d.stripe_payment_intent_id = pi.id
                await db.commit()
                legs.append(_leg_result_from_intent(DonationFrequency.MONTHLY, pi, donation_ids))

    return DonationConfirmResponse(legs=legs)


def _leg_result_from_intent(
    frequency: DonationFrequency, pi, donation_ids: list[uuid.UUID]
) -> LegResult:
    if pi.status == "succeeded":
        return LegResult(frequency=frequency, status="succeeded", donation_ids=donation_ids)
    if pi.status == "requires_action":
        return LegResult(
            frequency=frequency,
            status="requires_action",
            client_secret=pi.client_secret,
            donation_ids=donation_ids,
        )
    return LegResult(
        frequency=frequency,
        status="failed",
        message="Payment could not be completed.",
        donation_ids=donation_ids,
    )


@router.get("/by-ids", response_model=list[DonationRead])
async def get_donations_by_ids(
    ids: str,
    db: AsyncSession = Depends(get_db),
) -> list[Donation]:
    try:
        parsed_ids = [uuid.UUID(i) for i in ids.split(",") if i]
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid donation id."
        ) from exc

    result = await db.scalars(select(Donation).where(Donation.id.in_(parsed_ids)))
    donations = list(result.all())
    if not donations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No donations found.")
    return donations


@router.get("", response_model=list[DonationRead])
async def list_donations(
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[Donation]:
    query = select(Donation).order_by(Donation.created_at.desc()).limit(limit)
    result = await db.scalars(query)
    return list(result.all())
