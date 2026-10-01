#!/usr/bin/env python3
"""Generate Libcomlair's fixed French voice pack with Pocket TTS.

This script is intentionally separate from the runtime. It never promotes files to
`ready` in data/voice/libcomlair-fixed-audio.json. Human listening/Android validation
must happen before manifest promotion.

Pinned generator: pocket-tts==3.3.0
Pinned language: french
Pinned predefined voice: vera
Target format: WAV, 24 kHz, mono, 16-bit PCM
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import sys
import wave
from pathlib import Path

EXPECTED_POCKET_TTS_VERSION = "3.3.0"
LANGUAGE = "french"
VOICE = "vera"
EXPECTED_SAMPLE_RATE = 24000
ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "data/voice/libcomlair-fixed-audio.json"
DEFAULT_OUTPUT_DIR = ROOT / "assets/audio/fr-FR"

FILE_NAMES = {
    "welcome.main": "welcome-main.wav",
    "nav.next": "nav-next.wav",
    "nav.back": "nav-back.wav",
    "presentation.main": "presentation-main.wav",
    "diagnostic.open": "diagnostic-open.wav",
    "repair.start": "repair-start.wav",
    "micro.confirmation": "micro-confirmation.wav",
}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def validate_wav(path: Path) -> dict[str, int]:
    with wave.open(str(path), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frames = wav.getnframes()

    if channels != 1:
        raise RuntimeError(f"{path.name}: expected mono WAV, got {channels} channels")
    if sample_width != 2:
        raise RuntimeError(f"{path.name}: expected 16-bit PCM, got {sample_width * 8}-bit")
    if sample_rate != EXPECTED_SAMPLE_RATE:
        raise RuntimeError(
            f"{path.name}: expected {EXPECTED_SAMPLE_RATE} Hz, got {sample_rate} Hz"
        )

    return {
        "channels": channels,
        "sampleWidthBytes": sample_width,
        "sampleRate": sample_rate,
        "frames": frames,
    }


def load_entries(single: str | None) -> list[dict]:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest.get("locale") != "fr-FR":
        raise RuntimeError("Fixed-audio manifest locale must remain fr-FR for this generator")

    entries = manifest.get("entries", [])
    by_id = {entry.get("id"): entry for entry in entries}

    missing = sorted(set(FILE_NAMES) - set(by_id))
    if missing:
        raise RuntimeError(f"Manifest is missing fixed IDs: {', '.join(missing)}")

    if single:
        if single not in FILE_NAMES:
            raise RuntimeError(f"Unknown fixed voice ID: {single}")
        return [by_id[single]]

    return [by_id[entry_id] for entry_id in FILE_NAMES]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--single",
        help="Generate only one manifest ID, e.g. welcome.main. Default: all seven.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Destination directory. Defaults to assets/audio/fr-FR.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Allow replacement of already generated WAV files.",
    )
    args = parser.parse_args()

    try:
        installed_version = importlib.metadata.version("pocket-tts")
    except importlib.metadata.PackageNotFoundError:
        print(
            "Pocket TTS is not installed. Required pinned version: "
            f"pocket-tts=={EXPECTED_POCKET_TTS_VERSION}",
            file=sys.stderr,
        )
        return 2

    if installed_version != EXPECTED_POCKET_TTS_VERSION:
        print(
            "Refusing generation with an unreviewed Pocket TTS version: "
            f"installed={installed_version}, required={EXPECTED_POCKET_TTS_VERSION}",
            file=sys.stderr,
        )
        return 3

    try:
        import numpy as np
        import scipy.io.wavfile
        from pocket_tts import TTSModel
    except Exception as exc:
        print(f"Voice generator dependencies unavailable: {exc}", file=sys.stderr)
        return 4

    entries = load_entries(args.single)
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Loading Pocket TTS {installed_version}, language={LANGUAGE}, voice={VOICE}")
    model = TTSModel.load_model(language=LANGUAGE)

    generated = []
    for entry in entries:
        entry_id = entry["id"]
        text = entry.get("text", "").strip()
        if not text:
            raise RuntimeError(f"Empty text for {entry_id}")

        out = output_dir / FILE_NAMES[entry_id]
        if out.exists() and not args.overwrite:
            raise RuntimeError(f"Refusing to overwrite existing file without --overwrite: {out}")

        # Get a fresh immutable starting state per phrase so one generation cannot
        # leak state into the next phrase.
        voice_state = model.get_state_for_audio_prompt(VOICE)
        audio = model.generate_audio(voice_state, text)
        audio_np = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        audio_int16 = (audio_np * 32767).clip(-32768, 32767).astype(np.int16)
        scipy.io.wavfile.write(str(out), model.sample_rate, audio_int16)

        wav_info = validate_wav(out)
        generated.append(
            {
                "id": entry_id,
                "text": text,
                "asset": str(out.relative_to(ROOT)).replace("\\", "/"),
                "sha256": sha256_file(out),
                "bytes": out.stat().st_size,
                "wav": wav_info,
                "approval": "not-reviewed",
            }
        )
        print(f"Generated {entry_id}: {out.relative_to(ROOT)}")

    report = {
        "schemaVersion": 1,
        "status": "generated-not-approved",
        "generator": {
            "engine": "Pocket TTS",
            "package": "pocket-tts",
            "version": installed_version,
            "language": LANGUAGE,
            "voice": VOICE,
        },
        "rules": {
            "doesNotModifyRuntimeManifest": True,
            "androidListeningRequiredBeforePromotion": True,
            "manifestReadyStatusMustBeSetSeparatelyAfterApproval": True,
        },
        "entries": generated,
    }
    report_path = output_dir / "generated-pack-v1.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generation report: {report_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
