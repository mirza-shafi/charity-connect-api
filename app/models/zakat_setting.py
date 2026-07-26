import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ZakatSetting(Base):
    """Every admin update inserts a new row — the latest one (by updated_at) is
    the active setting. Gives us a free audit trail of Nisab changes over time.
    """

    __tablename__ = "zakat_settings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nisab_value: Mapped[float] = mapped_column(Numeric(12, 2, asdecimal=False))
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), default=None
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
