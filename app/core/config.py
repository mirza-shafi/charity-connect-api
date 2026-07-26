from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    environment: str = "development"

    # Postgres (async URL, e.g. postgresql+asyncpg://user:pass@localhost:5432/charity_connect)
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/charity_connect"
    )

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Auth
    jwt_secret_key: str = "change-me-in-.env"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    # CORS — origins allowed to call this API (charity-connect-web, in dev and prod)
    cors_origins: list[str] = ["http://localhost:3000"]

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Object storage — Cloudflare R2 in production (S3-compatible API), MinIO
    # locally for dev (same API, no real Cloudflare account needed to test).
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = ""
    r2_public_base_url: str = ""
    # Set only for local dev (e.g. http://localhost:9000 for MinIO). Leave
    # empty in production so the R2 endpoint is derived from r2_account_id.
    storage_endpoint_url: str = ""

    @property
    def storage_endpoint(self) -> str:
        if self.storage_endpoint_url:
            return self.storage_endpoint_url
        return f"https://{self.r2_account_id}.r2.cloudflarestorage.com"


settings = Settings()
