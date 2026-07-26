import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    summary: str = Field(min_length=1)
    content: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=100)
    campaign_id: uuid.UUID | None = None
    image_key: str | None = None
    published: bool = False


class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    summary: str | None = Field(default=None, min_length=1)
    content: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    campaign_id: uuid.UUID | None = None
    image_key: str | None = None
    published: bool | None = None


class BlogPostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    summary: str
    content: str
    category: str
    author_id: uuid.UUID | None
    campaign_id: uuid.UUID | None
    image_key: str | None
    published: bool
    published_at: datetime | None
    created_at: datetime
