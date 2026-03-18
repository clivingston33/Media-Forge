from fastapi import APIRouter, File, UploadFile

from app.models.schemas import TaskStartResponse
from app.services.rembg_service import queue_background_removal
from app.services.readiness_service import ensure_feature_ready
from app.utils.file_utils import save_upload_file

router = APIRouter(prefix="/api", tags=["background"])


@router.post("/remove-bg", response_model=TaskStartResponse)
async def remove_background(file: UploadFile = File(...)) -> TaskStartResponse:
    await ensure_feature_ready("remove_bg")
    source_path = await save_upload_file(file, "background")
    return await queue_background_removal(source_path, file.filename or source_path.name)
