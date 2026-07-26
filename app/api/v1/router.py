from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    blog,
    campaigns,
    contact,
    donations,
    events,
    gallery,
    health,
    hero_slides,
    stripe_webhook,
    uploads,
    volunteers,
    zakat,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(hero_slides.router, prefix="/hero-slides", tags=["hero-slides"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
api_router.include_router(gallery.router, prefix="/gallery-photos", tags=["gallery-photos"])
api_router.include_router(donations.router, prefix="/donations", tags=["donations"])
api_router.include_router(stripe_webhook.router, prefix="/stripe/webhook", tags=["stripe"])
api_router.include_router(volunteers.router, prefix="/volunteers", tags=["volunteers"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(zakat.router, prefix="/zakat-settings", tags=["zakat"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
