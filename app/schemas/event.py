import uuid
from datetime import date as date_
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    date: date_
    time: str = Field(min_length=1, max_length=100)
    location: str = Field(min_length=1, max_length=255)
    image_key: str | None = None


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    date: date_ | None = None
    time: str | None = Field(default=None, min_length=1, max_length=100)
    location: str | None = Field(default=None, min_length=1, max_length=255)
    image_key: str | None = None


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    description: str
    date: date_
    time: str
    location: str
    image_key: str | None
    created_at: datetime
    registrations_count: int = 0


class EventRegistrationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr


class EventRegistrationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    name: str
    email: EmailStr
    registered_at: datetime
