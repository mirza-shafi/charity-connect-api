from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.contact_message import ContactMessage
from app.schemas.contact import ContactCreate, ContactRead

router = APIRouter()


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
async def submit_contact_message(
    payload: ContactCreate, db: AsyncSession = Depends(get_db)
) -> ContactMessage:
    message = ContactMessage(
        name=payload.name.strip(),
        email=payload.email.lower(),
        message=payload.message.strip(),
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
