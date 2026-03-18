from fastapi import APIRouter, Query

from app.models.health import SystemHealth
from app.services.health_service import health_service

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=SystemHealth)
async def health(refresh: bool = Query(default=False)) -> SystemHealth:
    return await health_service.get(force_refresh=refresh)
