from fastapi import APIRouter, HTTPException, status

from app.models.schemas import SettingsPatchPayload, SettingsPayload
from app.services.health_service import health_service
from app.services.settings_service import SettingsValidationError, settings_service
from app.services.task_manager import task_manager

router = APIRouter(prefix="/api", tags=["settings"])


@router.get("/settings", response_model=SettingsPayload)
async def get_settings() -> SettingsPayload:
    return settings_service.get()


@router.patch("/settings", response_model=SettingsPayload)
async def patch_settings(payload: SettingsPatchPayload) -> SettingsPayload:
    try:
        settings = settings_service.patch(payload)
    except SettingsValidationError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    await task_manager.set_concurrency(settings.queue_concurrency)
    await health_service.refresh()
    return settings
