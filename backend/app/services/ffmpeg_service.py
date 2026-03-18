from __future__ import annotations

import asyncio
from pathlib import Path

from app.models.schemas import TaskStartResponse
from app.services.runner_service import last_error_message
from app.services.task_manager import task_manager
from app.utils.file_utils import format_file_size, sanitize_filename
from app.utils.paths import ffmpeg_path, ffprobe_path, output_dir
from app.utils.process import TaskCancelledError, run_process


def _ffmpeg_arguments(output_format: str) -> list[str]:
    if output_format == "mp3":
        return ["-vn", "-c:a", "libmp3lame", "-b:a", "320k"]
    if output_format == "wav":
        return ["-vn", "-c:a", "pcm_s16le"]
    if output_format == "aac":
        return ["-vn", "-c:a", "aac", "-b:a", "192k"]
    if output_format == "flac":
        return ["-vn", "-c:a", "flac"]
    if output_format == "gif":
        return [
            "-vf",
            "fps=12,scale=640:-1:flags=lanczos:force_original_aspect_ratio=decrease",
            "-loop",
            "0",
        ]
    if output_format == "mov":
        return ["-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac", "-b:a", "192k"]
    if output_format == "webm":
        return ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "33", "-c:a", "libopus", "-b:a", "128k"]
    return ["-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "192k"]


def _parse_ffmpeg_time(line: str) -> float | None:
    if line.startswith("out_time="):
        value = line.split("=", 1)[1]
        try:
            hours, minutes, seconds = value.split(":")
            return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
        except ValueError:
            return None

    if line.startswith("out_time_us="):
        try:
            return int(line.split("=", 1)[1]) / 1_000_000
        except ValueError:
            return None

    if line.startswith("out_time_ms="):
        try:
            raw_value = int(line.split("=", 1)[1])
        except ValueError:
            return None
        return raw_value / 1_000_000 if raw_value > 1_000_000 else raw_value / 1_000

    return None


async def _probe_duration_seconds(source_path: Path) -> float | None:
    command = [
        str(ffprobe_path()),
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(source_path),
    ]
    return_code, stdout_lines, _ = await run_process(command)
    if return_code != 0 or not stdout_lines:
        return None

    try:
        return float(stdout_lines[-1])
    except ValueError:
        return None


async def _run_conversion_task(task_id: str, source_path: Path, output_path: Path, output_format: str) -> None:
    try:
        duration_seconds = await _probe_duration_seconds(source_path)
        stage_label = "Encoding audio" if output_format in {"mp3", "wav", "aac", "flac"} else "Transcoding media"

        await task_manager.update_task(task_id, status="processing", progress=5, stage="Inspecting source streams")

        async def handle_stdout(line: str) -> None:
            parsed_seconds = _parse_ffmpeg_time(line)
            if parsed_seconds is not None and duration_seconds and duration_seconds > 0:
                progress = min(98, max(8, int(parsed_seconds * 100 / duration_seconds)))
                await task_manager.update_task(task_id, status="processing", progress=progress, stage=stage_label)
            elif line == "progress=end":
                await task_manager.update_task(task_id, status="processing", progress=99, stage="Writing export")

        command = [
            str(ffmpeg_path()),
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-nostdin",
            "-i",
            str(source_path),
            *_ffmpeg_arguments(output_format),
            "-progress",
            "pipe:1",
            "-nostats",
            str(output_path),
        ]

        return_code, stdout_lines, stderr_lines = await run_process(
            command,
            stdout_handler=handle_stdout,
            on_process_started=lambda process: task_manager.attach_process(task_id, process),
            on_process_finished=lambda process: task_manager.detach_process(task_id, process),
            cancel_checker=lambda: task_manager.is_cancellation_requested(task_id),
        )
        if return_code != 0:
            raise RuntimeError(last_error_message(stderr_lines, stdout_lines))

        await task_manager.update_task(
            task_id,
            status="done",
            progress=100,
            stage="Export complete",
            output_files=[str(output_path)],
        )
    except TaskCancelledError:
        output_path.unlink(missing_ok=True)
        raise
    except Exception as error:
        output_path.unlink(missing_ok=True)
        await task_manager.fail(task_id, str(error))
    finally:
        source_path.unlink(missing_ok=True)


async def queue_conversion(source_path: Path, original_name: str, output_format: str) -> TaskStartResponse:
    source_stem = sanitize_filename(Path(original_name).stem)
    task = await task_manager.create_task(
        "convert",
        original_name,
        size=format_file_size(source_path.stat().st_size),
    )

    target_path = output_dir() / f"{source_stem}_{task.id}.{output_format}"
    asyncio.create_task(task_manager.run_task(task.id, lambda: _run_conversion_task(task.id, source_path, target_path, output_format)))
    return TaskStartResponse(task_id=task.id, type="convert")
