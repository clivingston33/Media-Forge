from __future__ import annotations

import argparse
import json
import os
import sys
import threading
from contextlib import redirect_stdout
from pathlib import Path
import wave

import numpy as np
import torch
from demucs.apply import BagOfModels, apply_model
from demucs.pretrained import get_model
from demucs.separate import load_track


def emit(event: str, **payload) -> None:
    print(json.dumps({"event": event, **payload}), flush=True)


def save_wav(path: Path, audio: torch.Tensor, samplerate: int) -> None:
    clipped = audio.detach().cpu().clamp(-1, 1)
    pcm = (clipped.transpose(0, 1).contiguous().numpy() * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(pcm.shape[1])
        handle.setsampwidth(2)
        handle.setframerate(samplerate)
        handle.writeframes(pcm.tobytes())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--track-stem", required=True)
    parser.add_argument("--mode", required=True, choices=["vocals", "all_stems"])
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--model", default="htdemucs")
    parser.add_argument("--ffmpeg-dir")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    track_stem = args.track_stem
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.ffmpeg_dir:
        ffmpeg_dir = str(Path(args.ffmpeg_dir))
        current_path = os.environ.get("PATH", "")
        os.environ["PATH"] = ffmpeg_dir if not current_path else f"{ffmpeg_dir}{os.pathsep}{current_path}"

    emit("progress", progress=5, stage="Loading Demucs model")
    emit("progress", progress=12, stage="Preparing audio")

    stop_event = threading.Event()

    def progress_pump() -> None:
        progress = 18
        while not stop_event.wait(5):
            progress = min(90, progress + 6)
            emit("progress", progress=progress, stage="Separating stems")

    pump_thread = threading.Thread(target=progress_pump, daemon=True)
    pump_thread.start()

    try:
        with redirect_stdout(sys.stderr):
            model = get_model(args.model)
            if isinstance(model, BagOfModels):
                print(
                    f"Selected model is a bag of {len(model.models)} models. "
                    "You will see that many internal passes per track."
                )

            model.cpu()
            model.eval()
            print(f"Separated tracks will be stored in {(output_dir / args.model).resolve()}")
            print(f"Separating track {input_path}")

            wav = load_track(input_path, model.audio_channels, model.samplerate)
            ref = wav.mean(0)
            wav -= ref.mean()
            wav /= ref.std()
            sources = apply_model(
                model,
                wav[None],
                device=args.device,
                shifts=1,
                split=True,
                overlap=0.25,
                progress=False,
                num_workers=0,
            )[0]
            sources *= ref.std()
            sources += ref.mean()
    finally:
        stop_event.set()
        pump_thread.join(timeout=1)

    emit("progress", progress=95, stage="Collecting stem outputs")
    model_output_dir = output_dir / args.model
    model_output_dir.mkdir(parents=True, exist_ok=True)

    output_files: list[str] = []
    source_names = list(model.sources)

    if args.mode == "vocals":
        separated_sources = list(sources)
        try:
            vocals_index = source_names.index("vocals")
        except ValueError:
            print("The selected Demucs model does not expose a vocals stem.", file=sys.stderr)
            return 1

        vocals_path = model_output_dir / f"{track_stem}_vocals.wav"
        no_vocals_path = model_output_dir / f"{track_stem}_no_vocals.wav"
        save_wav(vocals_path, separated_sources.pop(vocals_index), model.samplerate)
        remainder = torch.zeros_like(separated_sources[0])
        for stem_audio in separated_sources:
            remainder += stem_audio
        save_wav(no_vocals_path, remainder, model.samplerate)
        output_files = [str(vocals_path), str(no_vocals_path)]
    else:
        for source_audio, source_name in zip(sources, source_names):
            stem_path = model_output_dir / f"{track_stem}_{source_name}.wav"
            save_wav(stem_path, source_audio, model.samplerate)
            output_files.append(str(stem_path))

    if not output_files:
        print("Demucs completed but no output stems were found.", file=sys.stderr)
        return 1

    emit("result", output_files=output_files)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
