(() => {
  "use strict";

  const VOICE_ID = "fr_FR-siwis-low";
  const TEST_TEXT = "Assistance vocale Libcomlair activée.";
  const status = document.getElementById("piperStatus");
  const prepare = document.getElementById("preparePiper");
  const listen = document.getElementById("listenPiper");
  const audio = document.getElementById("piperAudio");
  const details = document.getElementById("piperDetails");
  let audioUrl = "";

  const LIBRARIES = [
    "https://esm.sh/@mintplex-labs/piper-tts-web@1.0.3?bundle",
    "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.3/+esm"
  ];

  const RUNTIMES = [
    {
      name: "jsDelivr",
      onnxWasm: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/",
      piperData: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    },
    {
      name: "UNPKG",
      onnxWasm: "https://unpkg.com/onnxruntime-web@1.18.0/dist/",
      piperData: "https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm: "https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    }
  ];

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function capabilityReport() {
    const wasm = typeof WebAssembly === "object";
    const opfs = !!(navigator.storage && typeof navigator.storage.getDirectory === "function");
    const cores = navigator.hardwareConcurrency || "?";
    if (details) {
      details.textContent =
        "WebAssembly : " + (wasm ? "oui" : "non") +
        " • Stockage vocal local : " + (opfs ? "oui" : "non") +
        " • Processeurs logiques détectés : " + cores;
    }
    return { wasm, opfs };
  }

  function progressMessage(progress) {
    if (!progress || typeof progress !== "object") return;
    const total = Number(progress.total || 0);
    const loaded = Number(progress.loaded || 0);
    if (total > 0 && loaded >= 0) {
      const pct = Math.max(0, Math.min(100, Math.round(loaded * 100 / total)));
      setStatus("Téléchargement de la voix française : " + pct + " %");
    } else {
      setStatus("Téléchargement de la voix française en cours…");
    }
  }

  async function tryOne(libraryUrl, runtime) {
    setStatus("Chargement du moteur Piper • " + runtime.name + "…");
    const tts = await import(libraryUrl);
    if (!tts || typeof tts.TtsSession !== "function") {
      throw new Error("TtsSession indisponible.");
    }

    const session = await tts.TtsSession.create({
      voiceId: VOICE_ID,
      progress: progressMessage,
      logger: () => {},
      wasmPaths: {
        onnxWasm: runtime.onnxWasm,
        piperData: runtime.piperData,
        piperWasm: runtime.piperWasm
      }
    });

    setStatus("Génération du fichier audio avec " + runtime.name + "…");
    const wav = await session.predict(TEST_TEXT);
    if (!(wav instanceof Blob) || wav.size < 1000) {
      throw new Error("Le fichier audio généré est vide ou invalide.");
    }
    return { wav, runtime: runtime.name };
  }

  async function prepareVoice() {
    const caps = capabilityReport();
    if (!caps.wasm) {
      setStatus("⚠ WebAssembly n’est pas disponible sur ce navigateur.");
      return;
    }
    if (!caps.opfs) {
      setStatus("⚠ Le stockage vocal local n’est pas disponible sur ce navigateur.");
      return;
    }

    prepare.disabled = true;
    listen.hidden = true;
    const errors = [];

    try {
      for (const libraryUrl of LIBRARIES) {
        for (const runtime of RUNTIMES) {
          try {
            const result = await tryOne(libraryUrl, runtime);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            audioUrl = URL.createObjectURL(result.wav);
            audio.src = audioUrl;
            audio.load();
            listen.hidden = false;
            setStatus("✓ Voix de secours prête avec " + result.runtime + ". Appuyez sur « Écouter le test ».");
            return;
          } catch (error) {
            const message = error && error.message ? error.message : String(error || "Erreur inconnue");
            errors.push(runtime.name + " : " + message);
          }
        }
      }
      throw new Error(errors.join(" | "));
    } catch (error) {
      const message = error && error.message ? error.message : String(error || "Erreur inconnue");
      setStatus("⚠ Piper n’a pas pu préparer la voix. Détail : " + message);
      prepare.disabled = false;
    }
  }

  function listenVoice() {
    if (!audioUrl) {
      setStatus("La voix n’est pas encore préparée.");
      return;
    }
    audio.pause();
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => setStatus("▶ Lecture audio Piper démarrée."))
       .catch(error => {
         setStatus("⚠ Le fichier audio existe mais sa lecture a échoué : " + (error && error.message ? error.message : String(error)));
         audio.hidden = false;
       });
    }
  }

  prepare.addEventListener("click", prepareVoice);
  listen.addEventListener("click", listenVoice);
  audio.addEventListener("play", () => setStatus("▶ La voix de secours est en cours de lecture."));
  audio.addEventListener("ended", () => setStatus("✓ Test terminé. Si vous avez entendu la phrase, la voix de secours fonctionne."));
  audio.addEventListener("error", () => {
    setStatus("⚠ Le navigateur n’a pas pu lire le fichier audio généré.");
    audio.hidden = false;
  });

  capabilityReport();
})();