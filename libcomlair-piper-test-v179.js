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

  async function loadLibrary() {
    const sources = [
      "https://esm.sh/@mintplex-labs/piper-tts-web@1.0.3?bundle",
      "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.3/+esm"
    ];
    let lastError = null;
    for (const source of sources) {
      try {
        setStatus("Chargement du moteur vocal de secours…");
        return await import(source);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Impossible de charger Piper.");
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

  async function prepareVoice() {
    const caps = capabilityReport();
    if (!caps.wasm) {
      setStatus("⚠ WebAssembly n’est pas disponible sur ce navigateur.");
      return;
    }
    if (!caps.opfs) {
      setStatus("⚠ Le stockage vocal local n’est pas disponible sur ce navigateur. Le test Piper ne peut pas démarrer avec cette méthode.");
      return;
    }

    prepare.disabled = true;
    listen.hidden = true;
    try {
      const tts = await loadLibrary();
      if (!tts || typeof tts.predict !== "function") {
        throw new Error("La fonction Piper predict est indisponible.");
      }

      setStatus("Préparation de la voix française. Le premier téléchargement fait environ 28 Mo…");
      const wav = await tts.predict(
        { text: TEST_TEXT, voiceId: VOICE_ID },
        progressMessage
      );

      if (!(wav instanceof Blob) || wav.size < 1000) {
        throw new Error("Le fichier audio généré est vide ou invalide.");
      }

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioUrl = URL.createObjectURL(wav);
      audio.src = audioUrl;
      audio.load();
      listen.hidden = false;
      setStatus("✓ Voix de secours prête. Appuyez maintenant sur « Écouter le test ».");
    } catch (error) {
      const message = error && error.message ? error.message : String(error || "Erreur inconnue");
      setStatus("⚠ Piper n’a pas pu préparer la voix : " + message);
      prepare.disabled = false;
    }
  }

  function listenVoice() {
    if (!audioUrl) {
      setStatus("La voix n’est pas encore préparée.");
      return;
    }
    try {
      audio.pause();
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => setStatus("▶ Lecture audio Piper démarrée."))
          .catch(error => {
            const message = error && error.message ? error.message : String(error || "lecture refusée");
            setStatus("⚠ Le fichier audio a été généré, mais sa lecture a échoué : " + message);
            audio.hidden = false;
          });
      } else {
        setStatus("▶ Lecture audio Piper demandée.");
      }
    } catch (error) {
      setStatus("⚠ Impossible de lire le fichier audio : " + (error && error.message ? error.message : String(error)));
      audio.hidden = false;
    }
  }

  prepare.addEventListener("click", prepareVoice);
  listen.addEventListener("click", listenVoice);
  audio.addEventListener("play", () => setStatus("▶ La voix de secours est en cours de lecture."));
  audio.addEventListener("ended", () => setStatus("✓ Test terminé. Si vous avez entendu la phrase, Piper fonctionne sur ce téléphone."));
  audio.addEventListener("error", () => {
    setStatus("⚠ Le navigateur n’a pas pu lire le fichier audio généré.");
    audio.hidden = false;
  });

  capabilityReport();
})();