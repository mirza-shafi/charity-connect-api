import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DonationFrequency(StrEnum):
    ONE_TIME = "one_time"
    MONTHLY = "monthly"


class DonationStatus(StrEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    campaign_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("campaigns.id", ondelete="SET NULL"), default=None, index=True
    )
    donor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), default=None
    )
    donor_name: Mapped[str] = mapped_column(String(255))
    donor_email: Mapped[str] = mapped_column(String(255), index=True)
    donor_phone: Mapped[str | None] = mapped_column(String(50), default=None)
    # Optional "in memory of / on behalf of" note from the checkout form.
    dedication: Mapped[str | None] = mapped_column(String(255), default=None)
    # {country, address_line1, address_line2, city, county, postcode} from checkout.
    billing_details: Mapped[dict | None] = mapped_column(JSON, default=None)
    amount_cents: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10), default="usd")
    frequency: Mapped[DonationFrequency] = mapped_column(
        Enum(
            DonationFrequency,
            name="donation_frequency",
            native_enum=False,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
    )
    status: Mapped[DonationStatus] = mapped_column(
        Enum(
            DonationStatus,
            name="donation_status",
            native_enum=False,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=DonationStatus.PENDING,
    )
    is_fee: Mapped[bool] = mapped_column(Boolean, default=False)
    stripe_checkout_session_id: Mapped[str | None] = mapped_column(
        String(255), default=None, index=True
    )
    stripe_subscription_id: Mapped[str | None] = mapped_column(
        String(255), default=None, index=True
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), default=None)
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(
        String(255), default=None, index=True
    )
    # Set only on rows created from a subscription-renewal webhook, so a
    # redelivered `invoice.paid` event can be detected and skipped instead of
    # double-counting the campaign's raised total.
    stripe_invoice_id: Mapped[str | None] = mapped_column(String(255), default=None, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
