from fastapi import APIRouter, File, Form, UploadFile

from app.models.schemas import TaskStartResponse
from app.services.demucs_service import queue_voice_isolation
from app.services.readiness_service import ensure_feature_ready
from app.utils.file_utils import save_upload_file

router = APIRouter(prefix="/api", tags=["vocals"])


@router.post("/separate", response_model=TaskStartResponse)
async def separate(
    file: UploadFile = File(...),
    mode: str = Form(...),
) -> TaskStartResponse:
    await ensure_feature_ready("separate")
    source_path = await save_upload_file(file, "vocals")
    return await queue_voice_isolation(source_path, file.filename or source_path.name, mode)
