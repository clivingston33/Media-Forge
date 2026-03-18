from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from yt_dlp import YoutubeDL


def emit(event: str, **payload) -> None:
    print(json.dumps({"event": event, **payload}), flush=True)


def build_format_selector(output_format: str, quality: str) -> str:
    if output_format == "mp3" or quality == "audio_only":
        return "bestaudio/best"

    if output_format == "webm":
        if quality == "1080p":
            return "bestvideo[ext=webm][height<=1080]+bestaudio[ext=webm]/best[ext=webm]/best"
        if quality == "720p":
            return "bestvideo[ext=webm][height<=720]+bestaudio[ext=webm]/best[ext=webm]/best"
        if quality == "480p":
            return "bestvideo[ext=webm][height<=480]+bestaudio[ext=webm]/best[ext=webm]/best"
        return "bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best"

    if quality == "1080p":
        return "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best"
    if quality == "720p":
        return "bestvideo[height<=720]+bestaudio/best[height<=720]/best"
    if quality == "480p":
        return "bestvideo[height<=480]+bestaudio/best[height<=480]/best"
    return "bestvideo+bestaudio/best"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--cache-dir", required=True)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--format", required=True)
    parser.add_argument("--quality", required=True)
    parser.add_argument("--ffmpeg-location", required=True)
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    cache_dir = Path(args.cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)

    progress_state = {"last_percent": 0}

    def progress_hook(data: dict) -> None:
        status = data.get("status")

        if status == "downloading":
            total_bytes = data.get("total_bytes") or data.get("total_bytes_estimate") or 0
            downloaded_bytes = data.get("downloaded_bytes") or 0
            progress = progress_state["last_percent"]

            if total_bytes:
                progress = max(progress, min(94, int(downloaded_bytes * 100 / total_bytes)))
            else:
                progress = min(94, progress + 1)

            progress_state["last_percent"] = progress
            emit(
                "progress",
                progress=progress,
                stage="Downloading media",
                downloaded_bytes=downloaded_bytes,
                total_bytes=total_bytes,
            )
        elif status == "finished":
            emit("progress", progress=96, stage="Finalizing download")

    options = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "outtmpl": str(output_dir / f"{args.prefix}_%(title).80B_%(id)s.%(ext)s"),
        "paths": {
            "home": str(output_dir),
            "temp": str(cache_dir),
        },
        "ffmpeg_location": args.ffmpeg_location,
        "format": build_format_selector(args.format, args.quality),
        "progress_hooks": [progress_hook],
        "overwrites": True,
    }

    if args.format == "mp3" or args.quality == "audio_only":
        options["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }
        ]
    else:
        options["merge_output_format"] = args.format

    emit("progress", progress=1, stage="Resolving source media")

    try:
        with YoutubeDL(options) as ydl:
            ydl.extract_info(args.url, download=True)
    except Exception as error:
        print(str(error), file=sys.stderr)
        return 1

    output_files = sorted(
        str(path)
        for path in output_dir.glob(f"{args.prefix}_*")
        if path.is_file() and path.suffix not in {".part", ".ytdl"}
    )

    if not output_files:
        print("yt-dlp completed but no output file was found.", file=sys.stderr)
        return 1

    emit("result", output_files=output_files)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
