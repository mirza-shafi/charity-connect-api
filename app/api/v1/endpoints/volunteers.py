import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.models.volunteer import Volunteer, VolunteerStatus
from app.schemas.volunteer import VolunteerCreate, VolunteerRead, VolunteerStatusUpdate

router = APIRouter()


@router.post("", response_model=VolunteerRead, status_code=status.HTTP_201_CREATED)
async def apply_as_volunteer(
    payload: VolunteerCreate, db: AsyncSession = Depends(get_db)
) -> Volunteer:
    volunteer = Volunteer(
        name=payload.name.strip(),
        email=payload.email.lower(),
        phone=payload.phone.strip(),
        skills=payload.skills.strip(),
        interest_campaign_id=payload.interest_campaign_id,
    )
    db.add(volunteer)
    await db.commit()
    await db.refresh(volunteer)
    return volunteer


@router.get("", response_model=list[VolunteerRead])
async def list_volunteers(
    status_filter: VolunteerStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[Volunteer]:
    query = select(Volunteer)
    if status_filter is not None:
        query = query.where(Volunteer.status == status_filter)
    query = query.order_by(Volunteer.applied_at.desc())
    result = await db.scalars(query)
    return list(result.all())


@router.patch("/{volunteer_id}/status", response_model=VolunteerRead)
async def update_volunteer_status(
    volunteer_id: uuid.UUID,
    payload: VolunteerStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Volunteer:
    volunteer = await db.get(Volunteer, volunteer_id)
    if volunteer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer application not found."
        )
    volunteer.status = payload.status
    await db.commit()
    await db.refresh(volunteer)
    return volunteer
