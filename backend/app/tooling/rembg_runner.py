from __future__ import annotations

import argparse
import json
from pathlib import Path

from rembg import remove


def emit(event: str, **payload) -> None:
    print(json.dumps({"event": event, **payload}), flush=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    emit("progress", progress=5, stage="Loading image")
    image_bytes = input_path.read_bytes()

    emit("progress", progress=35, stage="Running background removal")
    result_bytes = remove(image_bytes)

    emit("progress", progress=85, stage="Writing transparent PNG")
    output_path.write_bytes(result_bytes)

    emit("result", output_files=[str(output_path)])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
