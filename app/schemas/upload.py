from pydantic import BaseModel, Field


class PresignRequest(BaseModel):
    content_type: str = Field(min_length=1, max_length=100)


class PresignResponse(BaseModel):
    upload_url: str
    public_url: str
    object_key: str
