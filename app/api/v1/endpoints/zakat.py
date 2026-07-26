from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.models.zakat_setting import ZakatSetting
from app.schemas.zakat import ZakatSettingRead, ZakatSettingUpdate

router = APIRouter()

DEFAULT_NISAB = 500.0


@router.get("", response_model=ZakatSettingRead)
async def get_zakat_setting(db: AsyncSession = Depends(get_db)) -> ZakatSetting:
    setting = await db.scalar(select(ZakatSetting).order_by(ZakatSetting.updated_at.desc()))
    if setting is None:
        # No admin has ever set one — return a sensible default without persisting it.
        return ZakatSetting(nisab_value=DEFAULT_NISAB, updated_at=datetime.now(UTC))
    return setting


@router.put("", response_model=ZakatSettingRead)
async def update_zakat_setting(
    payload: ZakatSettingUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> ZakatSetting:
    setting = ZakatSetting(nisab_value=payload.nisab_value, updated_by=admin.id)
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting
