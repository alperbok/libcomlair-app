package fr.libcomlair.app;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.graphics.Typeface;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.io.IOException;

public final class MainActivity extends Activity {
    private static final String VERA_ASSET = "vera-welcome.wav";

    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private TextView statusView;
    private boolean firstLaunchPlaybackAttempted = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        setContentView(buildContent());

        // Lecture Android native : aucun navigateur, aucune WebView et aucun geste utilisateur.
        playVeraAtLaunch();
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

        TextView subtitle = new TextView(this);
        subtitle.setText("Prototype Android natif — autonomie vocale");
        subtitle.setTextSize(20f);
        subtitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subtitleParams = matchWrap();
        subtitleParams.topMargin = dp(16);
        root.addView(subtitle, subtitleParams);

        TextView explanation = new TextView(this);
        explanation.setText("Vera doit démarrer automatiquement dès l'ouverture de l'application, sans toucher l'écran et sans connexion Internet.");
        explanation.setTextSize(18f);
        explanation.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams explanationParams = matchWrap();
        explanationParams.topMargin = dp(24);
        root.addView(explanation, explanationParams);

        statusView = new TextView(this);
        statusView.setText("Initialisation de la voix locale…");
        statusView.setTextSize(18f);
        statusView.setGravity(Gravity.CENTER);
        statusView.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);
        LinearLayout.LayoutParams statusParams = matchWrap();
        statusParams.topMargin = dp(28);
        root.addView(statusView, statusParams);

        Button replay = new Button(this);
        replay.setText("Réécouter Vera");
        replay.setTextSize(18f);
        replay.setOnClickListener(v -> playVera(false));
        LinearLayout.LayoutParams replayParams = matchWrap();
        replayParams.topMargin = dp(32);
        root.addView(replay, replayParams);

        TextView independence = new TextView(this);
        independence.setText("Test d'indépendance : cet écran ne demande aucune permission Internet et l'audio Vera est inclus dans l'APK.");
        independence.setTextSize(16f);
        independence.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams independenceParams = matchWrap();
        independenceParams.topMargin = dp(28);
        root.addView(independence, independenceParams);

        return root;
    }

    private void playVeraAtLaunch() {
        if (firstLaunchPlaybackAttempted) return;
        firstLaunchPlaybackAttempted = true;
        // post() laisse Android terminer l'affichage de l'Activity sans attendre un geste utilisateur.
        statusView.post(() -> playVera(true));
    }

    private void playVera(boolean automatic) {
        releasePlayer();
        requestAudioFocus();

        MediaPlayer player = new MediaPlayer();
        mediaPlayer = player;
        player.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build());

        try (AssetFileDescriptor afd = getAssets().openFd(VERA_ASSET)) {
            player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            player.setOnPreparedListener(mp -> {
                statusView.setText(automatic
                        ? "Vera démarre automatiquement depuis l'APK."
                        : "Lecture de Vera.");
                mp.start();
            });
            player.setOnCompletionListener(mp -> {
                statusView.setText("Lecture Vera terminée — audio Android natif opérationnel.");
                releasePlayer();
            });
            player.setOnErrorListener((mp, what, extra) -> {
                statusView.setText("Erreur de lecture locale Vera (" + what + "/" + extra + ").");
                releasePlayer();
                return true;
            });
            player.prepareAsync();
        } catch (IOException error) {
            statusView.setText("Impossible d'ouvrir l'audio Vera embarqué : " + error.getClass().getSimpleName());
            releasePlayer();
        }
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                    .setAudioAttributes(attributes)
                    .setOnAudioFocusChangeListener(focusChange -> { })
                    .build();
            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            // Compatibilité Android 7.x ; l'application cible reste Android au sens large.
            audioManager.requestAudioFocus(
                    focusChange -> { },
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
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

    private void releasePlayer() {
        MediaPlayer player = mediaPlayer;
        mediaPlayer = null;
        if (player != null) {
            try { player.stop(); } catch (IllegalStateException ignored) { }
            player.reset();
            player.release();
        }
        abandonAudioFocus();
    }

    @Override
    protected void onDestroy() {
        releasePlayer();
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
