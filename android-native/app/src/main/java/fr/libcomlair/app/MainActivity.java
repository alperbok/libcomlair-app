package fr.libcomlair.app;

import android.app.Activity;
import android.content.Context;
import android.graphics.Typeface;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final int MAX_AUTOMATIC_ATTEMPTS = 4;

    private final Handler handler = new Handler(Looper.getMainLooper());

    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private TextView statusView;

    private boolean playbackStarted = false;
    private boolean attemptInProgress = false;
    private int automaticAttempts = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        setContentView(buildContent());

        // Android natif : aucune WebView, aucun navigateur et aucun geste utilisateur.
        scheduleAutomaticPlayback(120);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!playbackStarted) {
            scheduleAutomaticPlayback(280);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && !playbackStarted) {
            scheduleAutomaticPlayback(450);
        }
    }

    private View buildContent() {
        int padding = dp(24);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(padding, padding, padding, padding);

        TextView title = new TextView(this);
        title.setText("Libcomlair");
        title.setTextSize(32f);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setGravity(Gravity.CENTER);
        root.addView(title, matchWrap());

        TextView version = new TextView(this);
        version.setText("Test Android natif Vera — version 0.2");
        version.setTextSize(20f);
        version.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams versionParams = matchWrap();
        versionParams.topMargin = dp(16);
        root.addView(version, versionParams);

        TextView explanation = new TextView(this);
        explanation.setText("Vera doit démarrer automatiquement dès l'ouverture de l'application, sans toucher l'écran et sans connexion Internet.");
        explanation.setTextSize(18f);
        explanation.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams explanationParams = matchWrap();
        explanationParams.topMargin = dp(24);
        root.addView(explanation, explanationParams);

        statusView = new TextView(this);
        statusView.setText("Préparation automatique de Vera…");
        statusView.setTextSize(18f);
        statusView.setGravity(Gravity.CENTER);
        statusView.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);
        LinearLayout.LayoutParams statusParams = matchWrap();
        statusParams.topMargin = dp(28);
        root.addView(statusView, statusParams);

        Button replay = new Button(this);
        replay.setText("Réécouter Vera");
        replay.setTextSize(18f);
        replay.setOnClickListener(v -> {
            playbackStarted = false;
            attemptInProgress = false;
            automaticAttempts = 0;
            startVera(false);
        });
        LinearLayout.LayoutParams replayParams = matchWrap();
        replayParams.topMargin = dp(32);
        root.addView(replay, replayParams);

        TextView independence = new TextView(this);
        independence.setText("Aucune permission Internet. Vera est une ressource audio Android intégrée directement dans cette application.");
        independence.setTextSize(16f);
        independence.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams independenceParams = matchWrap();
        independenceParams.topMargin = dp(28);
        root.addView(independence, independenceParams);

        return root;
    }

    private void scheduleAutomaticPlayback(long delayMs) {
        handler.postDelayed(() -> {
            if (!playbackStarted && !attemptInProgress && automaticAttempts < MAX_AUTOMATIC_ATTEMPTS) {
                startVera(true);
            }
        }, delayMs);
    }

    private void startVera(boolean automatic) {
        if (attemptInProgress || playbackStarted) return;

        attemptInProgress = true;
        if (automatic) {
            automaticAttempts++;
            statusView.setText("Démarrage automatique de Vera — tentative " + automaticAttempts + "…");
        } else {
            statusView.setText("Lecture de Vera…");
        }

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
                statusView.setText("Vera n'a pas pu être chargée par Android.");
                retryAutomatically();
                return;
            }

            mediaPlayer = player;
            player.setVolume(1.0f, 1.0f);
            player.setOnCompletionListener(mp -> {
                statusView.setText("Lecture Vera terminée — audio Android natif opérationnel.");
                releasePlayer(true);
            });
            player.setOnErrorListener((mp, what, extra) -> {
                playbackStarted = false;
                attemptInProgress = false;
                statusView.setText("Erreur audio Vera (" + what + "/" + extra + "). Nouvelle tentative automatique…");
                releasePlayer(true);
                retryAutomatically();
                return true;
            });

            player.start();
            playbackStarted = true;
            attemptInProgress = false;
            statusView.setText(automatic
                    ? "Vera a été lancée automatiquement par Android."
                    : "Vera est en cours de lecture.");

            // Vérification automatique : si Android a arrêté le lecteur au démarrage, on retente sans geste.
            handler.postDelayed(() -> {
                MediaPlayer activePlayer = mediaPlayer;
                if (activePlayer != null && playbackStarted) {
                    try {
                        if (!activePlayer.isPlaying() && activePlayer.getCurrentPosition() < activePlayer.getDuration() - 150) {
                            playbackStarted = false;
                            statusView.setText("Android a interrompu Vera. Nouvelle tentative automatique…");
                            releasePlayer(true);
                            retryAutomatically();
                        }
                    } catch (IllegalStateException ignored) {
                        playbackStarted = false;
                        retryAutomatically();
                    }
                }
            }, 700);
        } catch (RuntimeException error) {
            playbackStarted = false;
            attemptInProgress = false;
            statusView.setText("Erreur de démarrage Vera : " + error.getClass().getSimpleName() + ". Nouvelle tentative automatique…");
            releasePlayer(true);
            retryAutomatically();
        }
    }

    private void retryAutomatically() {
        if (automaticAttempts < MAX_AUTOMATIC_ATTEMPTS) {
            scheduleAutomaticPlayback(650L * Math.max(1, automaticAttempts));
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
            player.reset();
            player.release();
        }
        if (abandonFocus) abandonAudioFocus();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        releasePlayer(true);
        super.onDestroy();
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
