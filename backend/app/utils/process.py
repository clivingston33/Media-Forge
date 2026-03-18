from __future__ import annotations

import asyncio
import contextlib
import inspect
import logging
from collections.abc import Awaitable, Callable
from pathlib import Path

LineHandler = Callable[[str], Awaitable[None] | None]
ProcessHandler = Callable[[asyncio.subprocess.Process], Awaitable[None] | None]
CancelChecker = Callable[[], Awaitable[bool] | bool]


class TaskCancelledError(RuntimeError):
    pass


logger = logging.getLogger("mediaforge.process")


async def _pump_stream(
    stream: asyncio.StreamReader | None,
    collector: list[str],
    handler: LineHandler | None,
) -> None:
    if stream is None:
        return

    while True:
        raw_line = await stream.readline()
        if not raw_line:
            break

        line = raw_line.decode("utf-8", errors="replace").rstrip()
        if not line:
            continue

        collector.append(line)

        if handler is None:
            continue

        maybe_awaitable = handler(line)
        if inspect.isawaitable(maybe_awaitable):
            await maybe_awaitable


async def _watch_for_cancellation(
    process: asyncio.subprocess.Process,
    cancel_checker: CancelChecker,
    cancelled_event: asyncio.Event,
) -> None:
    while process.returncode is None:
        maybe_cancelled = cancel_checker()
        cancelled = await maybe_cancelled if inspect.isawaitable(maybe_cancelled) else maybe_cancelled

        if cancelled:
            cancelled_event.set()
            if process.returncode is None:
                process.terminate()
            try:
                await asyncio.wait_for(process.wait(), timeout=5)
            except asyncio.TimeoutError:
                if process.returncode is None:
                    process.kill()
            return

        await asyncio.sleep(0.25)


async def run_process(
    command: list[str],
    cwd: Path | None = None,
    stdout_handler: LineHandler | None = None,
    stderr_handler: LineHandler | None = None,
    on_process_started: ProcessHandler | None = None,
    on_process_finished: ProcessHandler | None = None,
    cancel_checker: CancelChecker | None = None,
) -> tuple[int, list[str], list[str]]:
    process = await asyncio.create_subprocess_exec(
        *command,
        cwd=str(cwd) if cwd else None,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    logger.info(
        "process_started",
        extra={
            "event": "process_started",
            "command": command,
            "cwd": str(cwd) if cwd else None,
            "pid": process.pid,
        },
    )

    if on_process_started is not None:
        maybe_awaitable = on_process_started(process)
        if inspect.isawaitable(maybe_awaitable):
            await maybe_awaitable

    stdout_lines: list[str] = []
    stderr_lines: list[str] = []
    cancelled_event = asyncio.Event()
    cancellation_task = (
        asyncio.create_task(_watch_for_cancellation(process, cancel_checker, cancelled_event)) if cancel_checker else None
    )

    try:
        await asyncio.gather(
            _pump_stream(process.stdout, stdout_lines, stdout_handler),
            _pump_stream(process.stderr, stderr_lines, stderr_handler),
        )

        return_code = await process.wait()
    finally:
        if cancellation_task is not None:
            cancellation_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await cancellation_task

        if on_process_finished is not None:
            maybe_awaitable = on_process_finished(process)
            if inspect.isawaitable(maybe_awaitable):
                await maybe_awaitable

    cancelled = cancelled_event.is_set()
    if not cancelled and cancel_checker is not None:
        maybe_cancelled = cancel_checker()
        cancelled = await maybe_cancelled if inspect.isawaitable(maybe_cancelled) else maybe_cancelled

    if cancelled:
        logger.info(
            "process_cancelled",
            extra={
                "event": "process_cancelled",
                "command": command,
                "cwd": str(cwd) if cwd else None,
                "pid": process.pid,
            },
        )
        raise TaskCancelledError("Task cancelled by user.")

    logger.info(
        "process_finished",
        extra={
            "event": "process_finished",
            "command": command,
            "cwd": str(cwd) if cwd else None,
            "pid": process.pid,
            "return_code": return_code,
        },
    )
    return return_code, stdout_lines, stderr_lines
