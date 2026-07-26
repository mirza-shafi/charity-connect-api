import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_optional_user, require_admin
from app.core.slugify import unique_slug
from app.models.blog_post import BlogPost
from app.models.user import User, UserRole
from app.schemas.blog_post import BlogPostCreate, BlogPostRead, BlogPostUpdate

router = APIRouter()


@router.get("", response_model=list[BlogPostRead])
async def list_posts(
    category: str = "",
    campaign_id: uuid.UUID | None = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> list[BlogPost]:
    query = select(BlogPost)

    is_admin = current_user is not None and current_user.role == UserRole.ADMIN
    if not is_admin:
        query = query.where(BlogPost.published.is_(True))

    if category:
        query = query.where(BlogPost.category == category)
    if campaign_id is not None:
        query = query.where(BlogPost.campaign_id == campaign_id)

    query = query.order_by(BlogPost.published_at.desc().nulls_last(), BlogPost.created_at.desc())
    query = query.limit(limit)
    result = await db.scalars(query)
    return list(result.all())


@router.get("/{slug}", response_model=BlogPostRead)
async def get_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> BlogPost:
    post = await db.scalar(select(BlogPost).where(BlogPost.slug == slug))
    is_admin = current_user is not None and current_user.role == UserRole.ADMIN
    if post is None or (not post.published and not is_admin):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return post


@router.post("", response_model=BlogPostRead, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: BlogPostCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> BlogPost:
    post = BlogPost(
        title=payload.title.strip(),
        slug=await unique_slug(db, BlogPost, payload.title),
        summary=payload.summary,
        content=payload.content,
        category=payload.category,
        campaign_id=payload.campaign_id,
        image_key=payload.image_key,
        published=payload.published,
        author_id=admin.id,
        published_at=datetime.now(UTC) if payload.published else None,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


@router.patch("/{post_id}", response_model=BlogPostRead)
async def update_post(
    post_id: uuid.UUID,
    payload: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> BlogPost:
    post = await db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

    data = payload.model_dump(exclude_unset=True)
    if "title" in data:
        post.slug = await unique_slug(db, BlogPost, data["title"])

    was_published = post.published
    for field, value in data.items():
        setattr(post, field, value)

    if post.published and not was_published:
        post.published_at = datetime.now(UTC)
    elif not post.published:
        post.published_at = None

    await db.commit()
    await db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    post = await db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    await db.delete(post)
    await db.commit()
