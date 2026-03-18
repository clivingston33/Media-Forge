from __future__ import annotations

import asyncio
from pathlib import Path

from app.models.schemas import TaskStartResponse
from app.services.runner_service import run_json_runner
from app.services.task_manager import task_manager
from app.utils.file_utils import format_file_size, sanitize_filename
from app.utils.paths import output_dir, runner_script, tool_python
from app.utils.process import TaskCancelledError


async def _run_background_removal_task(task_id: str, source_path: Path, output_path: Path) -> None:
    try:
        command = [
            str(tool_python()),
            str(runner_script("rembg_runner.py")),
            "--input",
            str(source_path),
            "--output",
            str(output_path),
        ]

        output_files = await run_json_runner(task_id, command)
        await task_manager.update_task(
            task_id,
            status="done",
            progress=100,
            stage="Transparent export complete",
            output_files=output_files,
        )
    except TaskCancelledError:
        output_path.unlink(missing_ok=True)
        raise
    except Exception as error:
        output_path.unlink(missing_ok=True)
        await task_manager.fail(task_id, str(error))
    finally:
        source_path.unlink(missing_ok=True)


async def queue_background_removal(source_path: Path, original_name: str) -> TaskStartResponse:
    safe_stem = sanitize_filename(Path(original_name).stem)
    task = await task_manager.create_task(
        "remove_bg",
        original_name,
        size=format_file_size(source_path.stat().st_size),
    )

    output_path = output_dir() / f"{safe_stem}_{task.id}_transparent.png"
    asyncio.create_task(task_manager.run_task(task.id, lambda: _run_background_removal_task(task.id, source_path, output_path)))
    return TaskStartResponse(task_id=task.id, type="remove_bg")
