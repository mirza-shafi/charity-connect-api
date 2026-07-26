import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_optional_user, require_admin
from app.core.slugify import unique_slug
from app.models.campaign import Campaign
from app.models.user import User, UserRole
from app.schemas.campaign import CampaignCreate, CampaignRead, CampaignUpdate

router = APIRouter()


@router.get("", response_model=list[CampaignRead])
async def list_campaigns(
    search: str = "",
    category: str = "",
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> list[Campaign]:
    query = select(Campaign)

    is_admin = current_user is not None and current_user.role == UserRole.ADMIN
    show_inactive = include_inactive and is_admin
    if not show_inactive:
        query = query.where(Campaign.active.is_(True))

    if category:
        query = query.where(Campaign.category == category)

    if search:
        like = f"%{search}%"
        query = query.where(or_(Campaign.title.ilike(like), Campaign.description.ilike(like)))

    query = query.order_by(Campaign.created_at.desc())
    result = await db.scalars(query)
    return list(result.all())


@router.get("/{slug}", response_model=CampaignRead)
async def get_campaign(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> Campaign:
    campaign = await db.scalar(select(Campaign).where(Campaign.slug == slug))
    is_admin = current_user is not None and current_user.role == UserRole.ADMIN
    if campaign is None or (not campaign.active and not is_admin):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found.")
    return campaign


@router.post("", response_model=CampaignRead, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    payload: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Campaign:
    campaign = Campaign(
        title=payload.title.strip(),
        slug=await unique_slug(db, Campaign, payload.title),
        description=payload.description,
        category=payload.category,
        goal=payload.goal,
        image_key=payload.image_key,
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign


@router.patch("/{campaign_id}", response_model=CampaignRead)
async def update_campaign(
    campaign_id: uuid.UUID,
    payload: CampaignUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Campaign:
    campaign = await db.get(Campaign, campaign_id)
    if campaign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found.")

    data = payload.model_dump(exclude_unset=True)
    if "title" in data:
        campaign.slug = await unique_slug(db, Campaign, data["title"])
    for field, value in data.items():
        setattr(campaign, field, value)

    await db.commit()
    await db.refresh(campaign)
    return campaign


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_campaign(
    campaign_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    campaign = await db.get(Campaign, campaign_id)
    if campaign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found.")
    campaign.active = False
    await db.commit()
