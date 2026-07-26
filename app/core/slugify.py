import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

_SLUG_RE = re.compile(r"[^a-z0-9]+")


def slugify(text: str) -> str:
    slug = _SLUG_RE.sub("-", text.lower()).strip("-")
    return slug or uuid.uuid4().hex[:8]


async def unique_slug(db: AsyncSession, model: type, text: str) -> str:
    """Slugify `text` and, if it collides with an existing row of `model`,
    append -2, -3, ... until it's unique."""
    base = slugify(text)
    slug = base
    suffix = 1
    while await db.scalar(select(model).where(model.slug == slug)):
        suffix += 1
        slug = f"{base}-{suffix}"
    return slug
