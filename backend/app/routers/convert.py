from fastapi import APIRouter, File, Form, UploadFile

from app.models.schemas import TaskStartResponse
from app.services.ffmpeg_service import queue_conversion
from app.services.readiness_service import ensure_feature_ready
from app.utils.file_utils import save_upload_file

router = APIRouter(prefix="/api", tags=["convert"])


@router.post("/convert", response_model=TaskStartResponse)
async def convert(
    file: UploadFile = File(...),
    output_format: str = Form(...),
) -> TaskStartResponse:
    await ensure_feature_ready("convert")
    source_path = await save_upload_file(file, "convert")
    return await queue_conversion(source_path, file.filename or source_path.name, output_format)
