from fastapi import APIRouter

from app.models.schemas import DownloadRequest, TaskStartResponse
from app.services.readiness_service import ensure_feature_ready
from app.services.ytdlp_service import queue_download

router = APIRouter(prefix="/api", tags=["download"])


@router.post("/download", response_model=TaskStartResponse)
async def download(request: DownloadRequest) -> TaskStartResponse:
    await ensure_feature_ready("download")
    return await queue_download(request)
