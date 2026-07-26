import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_optional_user, require_admin
from app.models.hero_slide import HeroSlide
from app.models.user import User, UserRole
from app.schemas.hero_slide import HeroSlideCreate, HeroSlideRead, HeroSlideUpdate

router = APIRouter()


@router.get("", response_model=list[HeroSlideRead])
async def list_hero_slides(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> list[HeroSlide]:
    query = select(HeroSlide)

    is_admin = current_user is not None and current_user.role == UserRole.ADMIN
    if not (include_inactive and is_admin):
        query = query.where(HeroSlide.active.is_(True))

    query = query.order_by(HeroSlide.sort_order.asc(), HeroSlide.created_at.asc())
    result = await db.scalars(query)
    return list(result.all())


@router.post("", response_model=HeroSlideRead, status_code=status.HTTP_201_CREATED)
async def create_hero_slide(
    payload: HeroSlideCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> HeroSlide:
    slide = HeroSlide(**payload.model_dump())
    db.add(slide)
    await db.commit()
    await db.refresh(slide)
    return slide


@router.patch("/{slide_id}", response_model=HeroSlideRead)
async def update_hero_slide(
    slide_id: uuid.UUID,
    payload: HeroSlideUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> HeroSlide:
    slide = await db.get(HeroSlide, slide_id)
    if slide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hero slide not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(slide, field, value)

    await db.commit()
    await db.refresh(slide)
    return slide


@router.delete("/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hero_slide(
    slide_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    slide = await db.get(HeroSlide, slide_id)
    if slide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hero slide not found.")
    await db.delete(slide)
    await db.commit()
