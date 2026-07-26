from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import require_admin
from app.core.storage import (
    ALLOWED_IMAGE_TYPES,
    build_object_key,
    build_public_url,
    generate_presigned_put_url,
)
from app.models.user import User
from app.schemas.upload import PresignRequest, PresignResponse

router = APIRouter()


@router.post("/presign", response_model=PresignResponse)
async def presign_upload(
    payload: PresignRequest,
    _admin: User = Depends(require_admin),
) -> PresignResponse:
    if payload.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type. Allowed: {', '.join(sorted(ALLOWED_IMAGE_TYPES))}",
        )

    object_key = build_object_key(payload.content_type)
    return PresignResponse(
        upload_url=generate_presigned_put_url(object_key, payload.content_type),
        public_url=build_public_url(object_key),
        object_key=object_key,
    )
