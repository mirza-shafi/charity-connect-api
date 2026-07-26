import stripe
from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import async_session_factory
from app.models.campaign import Campaign
from app.models.donation import Donation, DonationFrequency, DonationStatus

router = APIRouter()


async def _load_campaigns(db: AsyncSession, campaign_ids: set) -> dict:
    campaign_ids = {c for c in campaign_ids if c is not None}
    if not campaign_ids:
        return {}
    result = await db.scalars(select(Campaign).where(Campaign.id.in_(campaign_ids)))
    return {c.id: c for c in result.all()}


async def _complete_pending(db: AsyncSession, donations: list[Donation]) -> None:
    """Marks each still-pending donation completed and credits its campaign's
    `raised` total. Idempotent — an already-completed row is left untouched,
    so a redelivered webhook event is always safe to reprocess.
    """
    campaigns = await _load_campaigns(db, {d.campaign_id for d in donations})
    for donation in donations:
        if donation.status == DonationStatus.COMPLETED:
            continue
        donation.status = DonationStatus.COMPLETED
        if donation.campaign_id and not donation.is_fee:
            campaign = campaigns.get(donation.campaign_id)
            if campaign:
                campaign.raised = (campaign.raised or 0) + donation.amount_cents / 100


async def _handle_payment_intent_succeeded(db: AsyncSession, intent: dict) -> None:
    result = await db.scalars(
        select(Donation).where(Donation.stripe_payment_intent_id == intent["id"])
    )
    donations = list(result.all())
    if not donations:
        return
    await _complete_pending(db, donations)
    await db.commit()


def _invoice_subscription_id(invoice: dict) -> str | None:
    # As of the "Basil" API version, Invoice.subscription no longer exists —
    # the subscription reference moved to parent.subscription_details.subscription.
    # See: https://docs.stripe.com/changelog/basil/2025-03-31/invoice-parent-property
    parent = invoice.get("parent") or {}
    subscription_details = parent.get("subscription_details") or {}
    return subscription_details.get("subscription") or invoice.get("subscription")


async def _handle_invoice_paid(db: AsyncSession, invoice: dict) -> None:
    subscription_id = _invoice_subscription_id(invoice)
    billing_reason = invoice.get("billing_reason")
    if not subscription_id or billing_reason not in ("subscription_create", "subscription_cycle"):
        return

    if billing_reason == "subscription_create":
        # Donation rows already exist as PENDING (created by /donations/confirm
        # right before the subscription itself) — just mark them completed.
        result = await db.scalars(
            select(Donation).where(Donation.stripe_subscription_id == subscription_id)
        )
        donations = list(result.all())
        if donations:
            await _complete_pending(db, donations)
            await db.commit()
        return

    # subscription_cycle: a renewal. There's no pre-existing pending row for
    # this invoice, so a new completed Donation row is created per original
    # recurring line — guarded by stripe_invoice_id so a redelivered event
    # can't create the same renewal twice.
    already_recorded = await db.scalar(
        select(Donation.id).where(Donation.stripe_invoice_id == invoice["id"]).limit(1)
    )
    if already_recorded:
        return

    result = await db.scalars(
        select(Donation).where(
            Donation.stripe_subscription_id == subscription_id,
            Donation.is_fee.is_(False),
            Donation.frequency == DonationFrequency.MONTHLY,
        )
    )
    originals = list(result.all())
    if not originals:
        return

    campaigns = await _load_campaigns(db, {d.campaign_id for d in originals})

    for original in originals:
        db.add(
            Donation(
                campaign_id=original.campaign_id,
                donor_user_id=original.donor_user_id,
                donor_name=original.donor_name,
                donor_email=original.donor_email,
                donor_phone=original.donor_phone,
                dedication=original.dedication,
                billing_details=original.billing_details,
                amount_cents=original.amount_cents,
                currency=original.currency,
                frequency=DonationFrequency.MONTHLY,
                status=DonationStatus.COMPLETED,
                stripe_subscription_id=original.stripe_subscription_id,
                stripe_customer_id=original.stripe_customer_id,
                stripe_invoice_id=invoice["id"],
            )
        )
        if original.campaign_id:
            campaign = campaigns.get(original.campaign_id)
            if campaign:
                campaign.raised = (campaign.raised or 0) + original.amount_cents / 100

    await db.commit()


@router.post("", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request) -> dict:
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.SignatureVerificationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature."
        ) from exc

    # stripe-python's StripeObject only supports attribute access, not dict's
    # .get() — converting to a plain dict up front lets the handlers below use
    # ordinary dict methods against the event payload.
    data_object = event["data"]["object"].to_dict()

    async with async_session_factory() as db:
        if event["type"] == "payment_intent.succeeded":
            await _handle_payment_intent_succeeded(db, data_object)
        elif event["type"] == "invoice.paid":
            await _handle_invoice_paid(db, data_object)

    return {"received": True}
