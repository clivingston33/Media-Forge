from __future__ import annotations

import json

from app.services.task_manager import task_manager
from app.utils.process import run_process


def last_error_message(stderr_lines: list[str], stdout_lines: list[str]) -> str:
    for line in reversed(stderr_lines):
        if line.strip():
            return line.strip()

    for line in reversed(stdout_lines):
        if line.strip():
            return line.strip()

    return "The media process failed without a detailed error message."


async def run_json_runner(task_id: str, command: list[str]) -> list[str]:
    result_files: list[str] = []

    async def handle_stdout(line: str) -> None:
        nonlocal result_files

        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            return

        event_type = event.get("event")
        if event_type == "progress":
            await task_manager.update_task(
                task_id,
                status="processing",
                progress=int(event.get("progress", 0)),
                stage=event.get("stage"),
            )
        elif event_type == "result":
            result_files = [str(path) for path in event.get("output_files", [])]

    return_code, stdout_lines, stderr_lines = await run_process(
        command,
        stdout_handler=handle_stdout,
        on_process_started=lambda process: task_manager.attach_process(task_id, process),
        on_process_finished=lambda process: task_manager.detach_process(task_id, process),
        cancel_checker=lambda: task_manager.is_cancellation_requested(task_id),
    )

    if return_code != 0:
        raise RuntimeError(last_error_message(stderr_lines, stdout_lines))

    if not result_files:
        raise RuntimeError("The media process completed but did not report any output files.")

    return result_files
