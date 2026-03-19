from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import AppConfig, get_app_config
from app.core.http import register_http_handlers
from app.core.lifecycle import register_lifecycle_events
from app.services.logging_service import configure_backend_logging
from app.services.observability_service import configure_backend_observability


def create_app(config: AppConfig | None = None) -> FastAPI:
    app_config = config or get_app_config()

    configure_backend_logging()
    observability_status = configure_backend_observability()

    app = FastAPI(title=app_config.title)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(app_config.cors_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_http_handlers(app)
    register_lifecycle_events(app, observability_status)
    app.include_router(api_router)
    return app
