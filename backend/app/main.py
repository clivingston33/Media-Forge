from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers.background import router as background_router
from app.routers.convert import router as convert_router
from app.routers.download import router as download_router
from app.routers.health import router as health_router
from app.routers.settings import router as settings_router
from app.routers.tasks import router as tasks_router
from app.routers.vocals import router as vocals_router
from app.services.health_service import health_service
from app.services.logging_service import configure_backend_logging
from app.services.observability_service import configure_backend_observability
from app.services.settings_service import settings_service
from app.services.task_manager import task_manager
import logging
import time
from uuid import uuid4

configure_backend_logging()
observability_status = configure_backend_observability()

logger = logging.getLogger("mediaforge.api")
app = FastAPI(title="MediaForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = uuid4().hex[:10]
    start_time = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.exception(
            "request_failed",
            extra={
                "event": "request_failed",
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "duration_ms": duration_ms,
            },
        )
        raise

    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(
        "request_complete",
        extra={
            "event": "request_complete",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, error: Exception) -> JSONResponse:
    logger.exception(
        "unhandled_exception",
        extra={
            "event": "unhandled_exception",
            "method": request.method,
            "path": request.url.path,
        },
    )
    return JSONResponse(status_code=500, content={"detail": "Internal server error. Check backend logs for details."})


@app.on_event("startup")
async def prime_health_checks() -> None:
    logger.info(
        "backend_startup",
        extra={
            "event": "backend_startup",
            "queue_concurrency": settings_service.get().queue_concurrency,
            "crash_reporting_enabled": observability_status.enabled,
            "crash_reporting_environment": observability_status.environment,
            "release": observability_status.release,
        },
    )
    await task_manager.set_concurrency(settings_service.get().queue_concurrency)
    await health_service.refresh()

app.include_router(health_router)
app.include_router(download_router)
app.include_router(convert_router)
app.include_router(vocals_router)
app.include_router(background_router)
app.include_router(tasks_router)
app.include_router(settings_router)
