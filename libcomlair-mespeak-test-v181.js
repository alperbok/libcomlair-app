(() => {
  "use strict";
  const TEST_TEXT = "Assistance vocale Libcomlair activée.";
  const status = document.getElementById("voiceStatus");
  const prepare = document.getElementById("prepareVoice");
  const listen = document.getElementById("listenVoice");
  const details = document.getElementById("voiceDetails");

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function ready() {
    try {
      return !!(
        window.meSpeak &&
        typeof meSpeak.isConfigLoaded === "function" &&
        meSpeak.isConfigLoaded() &&
        typeof meSpeak.isVoiceLoaded === "function" &&
        meSpeak.isVoiceLoaded("fr")
      );
    } catch (_) {
      return false;
    }
  }

  function showCapabilities() {
    const audioContext = !!(window.AudioContext || window.webkitAudioContext);
    const htmlAudio = typeof Audio === "function";
    if (details) {
      details.textContent =
        "Moteur local : meSpeak/eSpeak • Web Audio : " + (audioContext ? "oui" : "non") +
        " • Audio HTML : " + (htmlAudio ? "oui" : "non");
    }
  }

  function waitUntilReady(startedAt) {
    if (ready()) {
      try { meSpeak.setDefaultVoice("fr"); } catch (_) {}
      listen.hidden = false;
      prepare.disabled = false;
      setStatus("✓ Voix française locale chargée. Appuyez maintenant sur « Écouter le test ».");
      return;
    }
    if (Date.now() - startedAt > 12000) {
      prepare.disabled = false;
      setStatus("⚠ La voix locale n’a pas terminé son chargement. Réessayez une fois.");
      return;
    }
    setTimeout(() => waitUntilReady(startedAt), 200);
  }

  function prepareVoice() {
    prepare.disabled = true;
    listen.hidden = true;
    setStatus("Chargement du moteur vocal local…");
    try {
      if (!window.meSpeak) throw new Error("Le moteur meSpeak n’est pas chargé.");
      meSpeak.loadConfig("vendor/mespeak/mespeak_config.json");
      meSpeak.loadVoice("vendor/mespeak/voices/fr.json");
      waitUntilReady(Date.now());
    } catch (error) {
      prepare.disabled = false;
      setStatus("⚠ Impossible de charger la voix locale : " + (error && error.message ? error.message : String(error)));
    }
  }

  function listenVoice() {
    if (!ready()) {
      setStatus("La voix locale n’est pas encore prête.");
      listen.hidden = true;
      return;
    }
    try {
      setStatus("Lecture du test en cours…");
      const result = meSpeak.speak(
        TEST_TEXT,
        { voice: "fr", speed: 155, pitch: 48, amplitude: 100 },
        () => setStatus("✓ Test terminé. Si vous avez entendu la phrase, le moteur vocal local fonctionne.")
      );
      if (result === 0 || result === false || result == null) {
        setStatus("⚠ Le moteur local n’a pas pu démarrer la lecture.");
      }
    } catch (error) {
      setStatus("⚠ Erreur pendant la lecture : " + (error && error.message ? error.message : String(error)));
    }
  }

  prepare.addEventListener("click", prepareVoice);
  listen.addEventListener("click", listenVoice);
  showCapabilities();
})();