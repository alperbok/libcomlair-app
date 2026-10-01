#!/usr/bin/env python3
"""Generate isolated French welcome-voice candidates for listening tests.

This tool is for comparison only. It never edits the runtime voice manifest and none
of its outputs are approved automatically.

Pinned engine: pocket-tts==3.3.0
Pinned language model: french
Target: WAV, 24 kHz, mono, 16-bit PCM
"""

from __future__ import annotations

import hashlib
import importlib.metadata
import json
import sys
import wave
from pathlib import Path

EXPECTED_POCKET_TTS_VERSION = "3.3.0"
LANGUAGE = "french"
EXPECTED_SAMPLE_RATE = 24000
ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/voice/libcomlair-fixed-audio.json"
OUTPUT_DIR = ROOT / "voice-candidates-output"

# Listening-only candidates from Pocket TTS' built-in predefined voice catalog.
# Using catalog voice names is intentional: the public no-voice-cloning model can
# load their precomputed states without requiring gated voice-cloning weights or
# a Hugging Face login. The selected voice's provenance/licence must still be
# audited separately before any runtime promotion.
CANDIDATES = [
    {
        "id": "A",
        "label": "candidate-a",
        "voiceSource": "estelle",
        "provenance": "Pocket TTS predefined voice catalog: estelle",
        "rightsNote": "Listening test only; audit selected voice before promotion",
    },
    {
        "id": "B",
        "label": "candidate-b",
        "voiceSource": "alba",
        "provenance": "Pocket TTS predefined voice catalog: alba",
        "rightsNote": "Listening test only; audit selected voice before promotion",
    },
    {
        "id": "C",
        "label": "candidate-c",
        "voiceSource": "vera",
        "provenance": "Pocket TTS predefined voice catalog: vera",
        "rightsNote": "Listening test only; audit selected voice before promotion",
    },
]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_wav(path: Path) -> dict[str, int]:
    with wave.open(str(path), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frames = wav.getnframes()

    if channels != 1:
        raise RuntimeError(f"{path.name}: expected mono, got {channels} channels")
    if sample_width != 2:
        raise RuntimeError(f"{path.name}: expected PCM16, got {sample_width * 8}-bit")
    if sample_rate != EXPECTED_SAMPLE_RATE:
        raise RuntimeError(f"{path.name}: expected 24000 Hz, got {sample_rate} Hz")

    return {
        "channels": channels,
        "sampleWidthBytes": sample_width,
        "sampleRate": sample_rate,
        "frames": frames,
    }


def welcome_text() -> str:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for entry in manifest.get("entries", []):
        if entry.get("id") == "welcome.main":
            text = str(entry.get("text", "")).strip()
            if text:
                return text
    raise RuntimeError("welcome.main text is missing from fixed-audio manifest")


def main() -> int:
    try:
        installed_version = importlib.metadata.version("pocket-tts")
    except importlib.metadata.PackageNotFoundError:
        print("pocket-tts is not installed", file=sys.stderr)
        return 2

    if installed_version != EXPECTED_POCKET_TTS_VERSION:
        print(
            f"Refusing unreviewed Pocket TTS version {installed_version}; "
            f"expected {EXPECTED_POCKET_TTS_VERSION}",
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

    text = welcome_text()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Loading Pocket TTS {installed_version}, language={LANGUAGE}")
    model = TTSModel.load_model(language=LANGUAGE)

    report_entries = []
    for candidate in CANDIDATES:
        output = OUTPUT_DIR / f"{candidate['label']}-welcome.wav"
        print(
            f"Generating candidate {candidate['id']} "
            f"with predefined voice {candidate['voiceSource']}"
        )
        state = model.get_state_for_audio_prompt(candidate["voiceSource"])
        audio = model.generate_audio(state, text)
        audio_np = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        audio_int16 = (audio_np * 32767).clip(-32768, 32767).astype(np.int16)
        scipy.io.wavfile.write(str(output), model.sample_rate, audio_int16)

        wav_info = validate_wav(output)
        report_entries.append(
            {
                "candidate": candidate["id"],
                "catalogVoice": candidate["voiceSource"],
                "file": output.name,
                "text": text,
                "provenance": candidate["provenance"],
                "rightsNote": candidate["rightsNote"],
                "sha256": sha256_file(output),
                "bytes": output.stat().st_size,
                "wav": wav_info,
                "approval": "listening-required",
            }
        )

    report = {
        "schemaVersion": 1,
        "status": "comparison-only-not-approved",
        "generator": {
            "engine": "Pocket TTS",
            "version": installed_version,
            "language": LANGUAGE,
        },
        "rules": {
            "doesNotModifyRuntime": True,
            "androidListeningRequired": True,
            "candidateNameMustNotImplyApproval": True,
            "usesOnlyPredefinedCatalogVoices": True,
            "requiresNoVoiceCloningWeights": True,
            "finalSelectedVoiceMustBePinnedAndRightsAuditedBeforePromotion": True,
        },
        "entries": report_entries,
    }
    report_path = OUTPUT_DIR / "welcome-candidates-report-v1.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(report_entries)} candidates and {report_path.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
