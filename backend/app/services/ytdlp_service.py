from __future__ import annotations

import asyncio
from pathlib import Path
from urllib.parse import urlparse

from app.models.schemas import DownloadRequest, TaskStartResponse
from app.services.runner_service import run_json_runner
from app.services.task_manager import task_manager
from app.utils.paths import cache_dir, ffmpeg_path, output_dir, runner_script, tool_python
from app.utils.process import TaskCancelledError


def _download_name(request: DownloadRequest) -> str:
    parsed = urlparse(request.url)
    host = parsed.netloc.replace("www.", "") or "media"
    suffix = "mp3" if request.format == "mp3" else request.format
    return f"{host}_{request.quality}.{suffix}"


def _cleanup_download_artifacts(task_id: str) -> None:
    for path in output_dir().glob(f"{task_id}_*"):
        if path.is_file():
            path.unlink(missing_ok=True)

    for path in cache_dir().glob(f"{task_id}_*"):
        if path.is_file():
            path.unlink(missing_ok=True)


async def _run_download_task(task_id: str, request: DownloadRequest) -> None:
    try:
        command = [
            str(tool_python()),
            str(runner_script("download_runner.py")),
            "--url",
            request.url,
            "--output-dir",
            str(output_dir()),
            "--cache-dir",
            str(cache_dir()),
            "--prefix",
            task_id,
            "--format",
            request.format,
            "--quality",
            request.quality,
            "--ffmpeg-location",
            str(ffmpeg_path()),
        ]

        output_files = await run_json_runner(task_id, command)
        await task_manager.update_task(
            task_id,
            status="done",
            progress=100,
            stage="Export complete",
            output_files=output_files,
        )
    except TaskCancelledError:
        _cleanup_download_artifacts(task_id)
        raise
    except Exception as error:
        _cleanup_download_artifacts(task_id)
        await task_manager.fail(task_id, str(error))


async def queue_download(request: DownloadRequest) -> TaskStartResponse:
    task = await task_manager.create_task("download", _download_name(request))
    asyncio.create_task(task_manager.run_task(task.id, lambda: _run_download_task(task.id, request)))
    return TaskStartResponse(task_id=task.id, type="download")
