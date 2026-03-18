from __future__ import annotations

import asyncio
import shutil
from pathlib import Path

from app.models.schemas import TaskStartResponse
from app.services.runner_service import run_json_runner
from app.services.task_manager import task_manager
from app.utils.file_utils import format_file_size, sanitize_filename
from app.utils.paths import demucs_device, ffmpeg_path, output_dir, runner_script, tool_python
from app.utils.process import TaskCancelledError


async def _run_voice_isolation_task(
    task_id: str,
    source_path: Path,
    output_root: Path,
    track_stem: str,
    mode: str,
) -> None:
    try:
        command = [
            str(tool_python()),
            str(runner_script("demucs_runner.py")),
            "--input",
            str(source_path),
            "--output-dir",
            str(output_root),
            "--track-stem",
            track_stem,
            "--mode",
            mode,
            "--device",
            demucs_device(),
            "--ffmpeg-dir",
            str(ffmpeg_path().parent),
        ]

        output_files = await run_json_runner(task_id, command)
        await task_manager.update_task(
            task_id,
            status="done",
            progress=100,
            stage="Stem export complete",
            output_files=output_files,
        )
    except TaskCancelledError:
        shutil.rmtree(output_root, ignore_errors=True)
        raise
    except Exception as error:
        shutil.rmtree(output_root, ignore_errors=True)
        await task_manager.fail(task_id, str(error))
    finally:
        source_path.unlink(missing_ok=True)


async def queue_voice_isolation(source_path: Path, original_name: str, mode: str) -> TaskStartResponse:
    safe_stem = sanitize_filename(Path(original_name).stem)
    task = await task_manager.create_task(
        "separate",
        original_name,
        size=format_file_size(source_path.stat().st_size),
    )

    output_root = output_dir() / f"{safe_stem}_{task.id}"
    asyncio.create_task(
        task_manager.run_task(
            task.id,
            lambda: _run_voice_isolation_task(task.id, source_path, output_root, safe_stem, mode),
        )
    )
    return TaskStartResponse(task_id=task.id, type="separate")
