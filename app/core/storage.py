import mimetypes
import uuid

import boto3
from botocore.config import Config as BotoConfig

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
PRESIGN_EXPIRES_SECONDS = 300


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.storage_endpoint,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
        config=BotoConfig(signature_version="s3v4", s3={"addressing_style": "path"}),
    )


def build_object_key(content_type: str) -> str:
    ext = mimetypes.guess_extension(content_type) or ""
    return f"uploads/{uuid.uuid4().hex}{ext}"


def build_public_url(object_key: str) -> str:
    return f"{settings.r2_public_base_url.rstrip('/')}/{object_key}"


def generate_presigned_put_url(object_key: str, content_type: str) -> str:
    client = get_s3_client()
    return client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.r2_bucket_name,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=PRESIGN_EXPIRES_SECONDS,
    )


def ensure_bucket_cors() -> None:
    """Allow the frontend origin(s) to PUT directly to the bucket via a
    presigned URL. Safe to call on every startup — it's idempotent. Not
    fatal if it fails (e.g. bucket/credentials not configured yet).
    """
    if not settings.r2_bucket_name:
        return

    try:
        client = get_s3_client()
        client.put_bucket_cors(
            Bucket=settings.r2_bucket_name,
            CORSConfiguration={
                "CORSRules": [
                    {
                        "AllowedOrigins": settings.cors_origins,
                        "AllowedMethods": ["GET", "PUT", "HEAD"],
                        "AllowedHeaders": ["*"],
                        "ExposeHeaders": ["ETag"],
                        "MaxAgeSeconds": 3000,
                    }
                ]
            },
        )
    except Exception:  # noqa: BLE001 — best-effort dev convenience, never fatal
        pass
