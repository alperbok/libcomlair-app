package fr.libcomlair.app;

import android.app.Activity;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public final class MainActivity extends Activity {
    private static final String LIBCOMLAIR_URL = "file:///android_asset/www/test-v224-master-frame-integration-v2.html?android-app=0.4";
    private static final int MAX_AUTOMATIC_ATTEMPTS = 4;

    private final Handler handler = new Handler(Looper.getMainLooper());

    private WebView webView;
    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private boolean playbackStarted = false;
    private boolean attemptInProgress = false;
    private int automaticAttempts = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

        webView = new WebView(this);
        configureWebView(webView);
        setContentView(webView);
        webView.loadUrl(LIBCOMLAIR_URL);

        // Vera fait partie de Libcomlair et est lue depuis l'APK de Libcomlair.
        // Aucun navigateur externe et aucun service vocal distant ne sont requis pour l'accueil.
        scheduleAutomaticPlayback(180);
    }

    @SuppressWarnings("deprecation")
    private void configureWebView(WebView view) {
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        view.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // La voix d'accueil est gérée par l'application Libcomlair elle-même.
                // On neutralise uniquement l'ancien lecteur d'accueil HTML afin d'éviter une double lecture.
                String script = "(function(){" +
                        "window.__LIBCOMLAIR_NATIVE_WELCOME__=true;" +
                        "function stopOldWelcome(){" +
                        "var a=document.getElementById('libcomlairWelcomeAutoplay');" +
                        "if(a){try{a.pause();}catch(e){} a.removeAttribute('autoplay');}" +
                        "}" +
                        "stopOldWelcome();setTimeout(stopOldWelcome,500);setTimeout(stopOldWelcome,1500);" +
                        "})();";
                view.evaluateJavascript(script, null);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        if (!playbackStarted) scheduleAutomaticPlayback(320);
    }

    private void scheduleAutomaticPlayback(long delayMs) {
        handler.postDelayed(() -> {
            if (!playbackStarted && !attemptInProgress && automaticAttempts < MAX_AUTOMATIC_ATTEMPTS) {
                startVera();
            }
        }, delayMs);
    }

    private void startVera() {
        if (attemptInProgress || playbackStarted) return;
        attemptInProgress = true;
        automaticAttempts++;

        releasePlayer(false);
        requestAudioFocus();

        AudioAttributes attributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build();

        try {
            MediaPlayer player = MediaPlayer.create(this, R.raw.vera_welcome, attributes, 0);
            if (player == null) {
                attemptInProgress = false;
                retryAutomatically("Vera n'a pas pu être chargée dans Libcomlair.");
                return;
            }

            mediaPlayer = player;
            player.setVolume(1.0f, 1.0f);
            player.setOnCompletionListener(mp -> releasePlayer(true));
            player.setOnErrorListener((mp, what, extra) -> {
                playbackStarted = false;
                attemptInProgress = false;
                releasePlayer(true);
                retryAutomatically("Erreur audio Libcomlair (" + what + "/" + extra + ").");
                return true;
            });

            player.start();
            playbackStarted = true;
            attemptInProgress = false;

            handler.postDelayed(() -> {
                MediaPlayer activePlayer = mediaPlayer;
                if (activePlayer != null && playbackStarted) {
                    try {
                        if (!activePlayer.isPlaying() && activePlayer.getCurrentPosition() < activePlayer.getDuration() - 150) {
                            playbackStarted = false;
                            releasePlayer(true);
                            retryAutomatically("Le système a interrompu la voix intégrée à Libcomlair.");
                        }
                    } catch (IllegalStateException ignored) {
                        playbackStarted = false;
                        retryAutomatically("La lecture intégrée à Libcomlair a été interrompue.");
                    }
                }
            }, 700);
        } catch (RuntimeException error) {
            playbackStarted = false;
            attemptInProgress = false;
            releasePlayer(true);
            retryAutomatically("Impossible de démarrer la voix intégrée à Libcomlair : " + error.getClass().getSimpleName());
        }
    }

    private void retryAutomatically(String message) {
        if (automaticAttempts < MAX_AUTOMATIC_ATTEMPTS) {
            scheduleAutomaticPlayback(650L * Math.max(1, automaticAttempts));
        } else {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        }
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                    .setAudioAttributes(attributes)
                    .setOnAudioFocusChangeListener(focusChange -> { })
                    .build();
            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            audioManager.requestAudioFocus(
                    focusChange -> { },
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
            );
        }
    }

    private void abandonAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
            audioManager.abandonAudioFocusRequest(audioFocusRequest);
            audioFocusRequest = null;
        }
    }

    private void releasePlayer(boolean abandonFocus) {
        MediaPlayer player = mediaPlayer;
        mediaPlayer = null;
        if (player != null) {
            try {
                if (player.isPlaying()) player.stop();
            } catch (IllegalStateException ignored) { }
            try { player.reset(); } catch (IllegalStateException ignored) { }
            player.release();
        }
        if (abandonFocus) abandonAudioFocus();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        releasePlayer(true);
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
