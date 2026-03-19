from fastapi import APIRouter

from app.routers.background import router as background_router
from app.routers.convert import router as convert_router
from app.routers.download import router as download_router
from app.routers.health import router as health_router
from app.routers.settings import router as settings_router
from app.routers.tasks import router as tasks_router
from app.routers.vocals import router as vocals_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(download_router)
api_router.include_router(convert_router)
api_router.include_router(vocals_router)
api_router.include_router(background_router)
api_router.include_router(tasks_router)
api_router.include_router(settings_router)
