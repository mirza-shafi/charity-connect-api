import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.models.gallery_photo import GalleryPhoto
from app.models.user import User
from app.schemas.gallery_photo import GalleryPhotoCreate, GalleryPhotoRead

router = APIRouter()


@router.get("", response_model=list[GalleryPhotoRead])
async def list_gallery_photos(
    category: str = "",
    db: AsyncSession = Depends(get_db),
) -> list[GalleryPhoto]:
    query = select(GalleryPhoto)
    if category:
        query = query.where(GalleryPhoto.category == category)
    query = query.order_by(GalleryPhoto.created_at.desc())
    result = await db.scalars(query)
    return list(result.all())


@router.post("", response_model=GalleryPhotoRead, status_code=status.HTTP_201_CREATED)
async def create_gallery_photo(
    payload: GalleryPhotoCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> GalleryPhoto:
    photo = GalleryPhoto(**payload.model_dump())
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return photo


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_photo(
    photo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    photo = await db.get(GalleryPhoto, photo_id)
    if photo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found.")
    await db.delete(photo)
    await db.commit()
