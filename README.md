# Charity Connect API

Backend for Charity Connect — FastAPI + PostgreSQL + Redis + Stripe + Cloudflare R2.
Serves [`charity-connect-web`](https://github.com/mirza-shafi/charity-connect-web) (Next.js).

See `../plan.md` and `../progress.md` in the project root for the full
architecture, feature scope, and phase tracker.

## Getting started

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt

cp .env.example .env   # fill in secrets (JWT key, Stripe, R2)

docker compose up -d db redis   # Postgres on localhost:5433, Redis on 6379
alembic upgrade head

uvicorn app.main:app --reload
```

API is served at `http://localhost:8000`, routes under `/api/v1/...`
(e.g. `/api/v1/health`, `/api/v1/auth/register`).

To run everything (API included) in Docker: `docker compose up -d`.

## Stack

- **FastAPI** (async), **SQLAlchemy 2.0** (async, `asyncpg` driver), **Alembic** migrations
- **PostgreSQL**
- **Redis** — caching, rate limiting, and `arq` background jobs (e.g. sending
  campaign-update emails to subscribed donors)
- **Stripe** — payments (one-time + recurring donations), webhooks
- **Cloudflare R2** (S3-compatible, via `boto3`) — campaign/event/blog images,
  uploaded directly from the browser via presigned URLs
- **JWT** auth (`pyjwt`) with `pwdlib`/argon2 password hashing, roles: `admin`, `donor`

## Project structure

```
app/
  main.py           # FastAPI app, CORS, router mounting
  core/
    config.py       # Settings (reads .env)
    security.py      # password hashing, JWT issue/verify
    redis.py          # Redis client
  db/
    base.py           # SQLAlchemy declarative Base
    session.py         # async engine + get_db dependency
  models/             # SQLAlchemy ORM models
  schemas/            # Pydantic request/response models
  api/
    deps.py            # get_current_user, require_admin
    v1/
      router.py         # aggregates all v1 routers
      endpoints/         # one module per resource (auth, health, ...)
alembic/              # migrations (async template)
docker-compose.yml    # db + redis (+ api) for local dev
```

## Notes for future work

- Postgres is mapped to host port **5433**, not 5432 — something else on this
  machine already had 5432 bound when this was scaffolded.
- Auth is JWT access/refresh tokens (no server-side session store yet). If we
  need token revocation before expiry, that's a Redis-backed denylist, not a
  redesign.
- Only the `users` table + `/auth/register|login|refresh|me` exist so far.
  Campaigns/events/blog/volunteers/donations models + endpoints are Phase 1-3
  work per `../plan.md`.
