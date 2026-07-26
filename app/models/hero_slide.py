import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class HeroSlide(Base):
    __tablename__ = "hero_slides"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    headline: Mapped[str] = mapped_column(String(255))
    badge_text: Mapped[str] = mapped_column(String(120))
    cta_label: Mapped[str] = mapped_column(String(60))
    cta_href: Mapped[str] = mapped_column(String(255))
    image_key: Mapped[str] = mapped_column(String(512))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
