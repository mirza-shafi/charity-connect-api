import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CampaignCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=100)
    goal: float = Field(gt=0)
    image_key: str | None = None


class CampaignUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    goal: float | None = Field(default=None, gt=0)
    image_key: str | None = None
    active: bool | None = None


class CampaignRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    description: str
    category: str
    goal: float
    raised: float
    image_key: str | None
    active: bool
    created_at: datetime
