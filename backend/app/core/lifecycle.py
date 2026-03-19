from __future__ import annotations

import logging

from fastapi import FastAPI

from app.services.health_service import health_service
from app.services.observability_service import BackendObservabilityStatus
from app.services.settings_service import settings_service
from app.services.task_manager import task_manager

logger = logging.getLogger("mediaforge.api")


def register_lifecycle_events(app: FastAPI, observability_status: BackendObservabilityStatus) -> None:
    @app.on_event("startup")
    async def prime_health_checks() -> None:
        settings = settings_service.get()
        logger.info(
            "backend_startup",
            extra={
                "event": "backend_startup",
                "queue_concurrency": settings.queue_concurrency,
                "crash_reporting_enabled": observability_status.enabled,
                "crash_reporting_environment": observability_status.environment,
                "release": observability_status.release,
            },
        )
        await task_manager.set_concurrency(settings.queue_concurrency)
        await health_service.refresh()
