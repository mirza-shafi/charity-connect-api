import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GalleryPhotoCreate(BaseModel):
    image_key: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=100)
    alt_text: str | None = None


class GalleryPhotoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    image_key: str
    category: str
    alt_text: str | None
    created_at: datetime
