import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.donation import DonationFrequency, DonationStatus


class DonationBasketItem(BaseModel):
    campaign_id: uuid.UUID
    amount_cents: int = Field(gt=0)
    frequency: DonationFrequency


class BillingAddress(BaseModel):
    country: str = Field(min_length=1, max_length=100)
    address_line1: str = Field(min_length=1, max_length=255)
    address_line2: str | None = None
    city: str = Field(min_length=1, max_length=100)
    county: str | None = None
    postcode: str = Field(min_length=1, max_length=20)


class SetupIntentResponse(BaseModel):
    customer_id: str
    client_secret: str


class DonationConfirmRequest(BaseModel):
    customer_id: str
    payment_method_id: str
    items: list[DonationBasketItem] = Field(min_length=1)
    cover_fee: bool = False
    donor_name: str = Field(min_length=1, max_length=255)
    donor_email: EmailStr
    donor_phone: str | None = None
    dedication: str | None = None
    billing: BillingAddress


class LegResult(BaseModel):
    frequency: DonationFrequency
    status: str
    client_secret: str | None = None
    message: str | None = None
    donation_ids: list[uuid.UUID] = Field(default_factory=list)


class DonationConfirmResponse(BaseModel):
    legs: list[LegResult]


class DonationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    campaign_id: uuid.UUID | None
    donor_name: str
    donor_email: str
    amount_cents: int
    currency: str
    frequency: DonationFrequency
    status: DonationStatus
    is_fee: bool
    created_at: datetime
