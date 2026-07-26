import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.volunteer import VolunteerStatus


class VolunteerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=50)
    skills: str = Field(min_length=1)
    interest_campaign_id: uuid.UUID | None = None


class VolunteerStatusUpdate(BaseModel):
    status: VolunteerStatus


class VolunteerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str
    skills: str
    interest_campaign_id: uuid.UUID | None
    status: VolunteerStatus
    applied_at: datetime
