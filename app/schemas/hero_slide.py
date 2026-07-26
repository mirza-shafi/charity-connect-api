import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class HeroSlideCreate(BaseModel):
    headline: str = Field(min_length=1, max_length=255)
    badge_text: str = Field(min_length=1, max_length=120)
    cta_label: str = Field(min_length=1, max_length=60)
    cta_href: str = Field(min_length=1, max_length=255)
    image_key: str = Field(min_length=1)
    sort_order: int = 0


class HeroSlideUpdate(BaseModel):
    headline: str | None = Field(default=None, min_length=1, max_length=255)
    badge_text: str | None = Field(default=None, min_length=1, max_length=120)
    cta_label: str | None = Field(default=None, min_length=1, max_length=60)
    cta_href: str | None = Field(default=None, min_length=1, max_length=255)
    image_key: str | None = Field(default=None, min_length=1)
    sort_order: int | None = None
    active: bool | None = None


class HeroSlideRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    headline: str
    badge_text: str
    cta_label: str
    cta_href: str
    image_key: str
    sort_order: int
    active: bool
    created_at: datetime
