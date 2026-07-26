import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.core.slugify import unique_slug
from app.models.event import Event, EventRegistration
from app.models.user import User
from app.schemas.event import (
    EventCreate,
    EventRead,
    EventRegistrationCreate,
    EventRegistrationRead,
    EventUpdate,
)

router = APIRouter()


async def _with_registration_count(db: AsyncSession, event: Event) -> EventRead:
    count = await db.scalar(
        select(func.count()).select_from(EventRegistration).where(
            EventRegistration.event_id == event.id
        )
    )
    return EventRead.model_validate(event, from_attributes=True).model_copy(
        update={"registrations_count": count or 0}
    )


@router.get("", response_model=list[EventRead])
async def list_events(search: str = "", db: AsyncSession = Depends(get_db)) -> list[EventRead]:
    query = select(Event)
    if search:
        like = f"%{search}%"
        query = query.where(
            or_(
                Event.title.ilike(like),
                Event.description.ilike(like),
                Event.location.ilike(like),
            )
        )
    query = query.order_by(Event.date.asc())
    events = (await db.scalars(query)).all()
    return [await _with_registration_count(db, e) for e in events]


@router.get("/{slug}", response_model=EventRead)
async def get_event(slug: str, db: AsyncSession = Depends(get_db)) -> EventRead:
    event = await db.scalar(select(Event).where(Event.slug == slug))
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    return await _with_registration_count(db, event)


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: EventCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> EventRead:
    event = Event(
        title=payload.title.strip(),
        slug=await unique_slug(db, Event, payload.title),
        description=payload.description,
        date=payload.date,
        time=payload.time,
        location=payload.location,
        image_key=payload.image_key,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return await _with_registration_count(db, event)


@router.patch("/{event_id}", response_model=EventRead)
async def update_event(
    event_id: uuid.UUID,
    payload: EventUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> EventRead:
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    data = payload.model_dump(exclude_unset=True)
    if "title" in data:
        event.slug = await unique_slug(db, Event, data["title"])
    for field, value in data.items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)
    return await _with_registration_count(db, event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    await db.delete(event)
    await db.commit()


@router.post(
    "/{slug}/register",
    response_model=EventRegistrationRead,
    status_code=status.HTTP_201_CREATED,
)
async def register_for_event(
    slug: str,
    payload: EventRegistrationCreate,
    db: AsyncSession = Depends(get_db),
) -> EventRegistration:
    event = await db.scalar(select(Event).where(Event.slug == slug))
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    existing = await db.scalar(
        select(EventRegistration).where(
            EventRegistration.event_id == event.id,
            EventRegistration.email == payload.email.lower(),
        )
    )
    if existing is not None:
        return existing

    registration = EventRegistration(
        event_id=event.id, name=payload.name.strip(), email=payload.email.lower()
    )
    db.add(registration)
    await db.commit()
    await db.refresh(registration)
    return registration
