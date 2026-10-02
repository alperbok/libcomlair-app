package fr.libcomlair.app;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;

public final class MainActivity extends Activity {
    private static final String LIBCOMLAIR_URL = "file:///android_asset/www/test-v224-master-frame-integration-v2.html?android-app=0.6";
    private static final int MAX_ENCODED_AUDIO_BYTES = 8 * 1024 * 1024;

    private WebView webView;
    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private File transientAudioFile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

        webView = new WebView(this);
        configureWebView(webView);
        webView.addJavascriptInterface(new SupportAudioBridge(), "LibcomlairSupportAudio");
        setContentView(webView);
        webView.loadUrl(LIBCOMLAIR_URL);
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
        view.setWebViewClient(new WebViewClient());
    }

    private final class SupportAudioBridge {
        @JavascriptInterface
        public String playFixed(String messageId, String assetPath, String voice) {
            final String id = messageId == null ? "" : messageId;
            final String path = assetPath == null ? "" : assetPath;

            if (!isAllowedLibcomlairAudioPath(path)) {
                runOnUiThread(() -> notifyLibcomlair(id, "error", "invalid-audio-path"));
                return "rejected";
            }

            runOnUiThread(() -> playLibcomlairAsset(id, path));
            return "accepted";
        }

        @JavascriptInterface
        public String playEncoded(String messageId, String mimeType, String base64Audio) {
            final String id = messageId == null ? "" : messageId;
            final String mime = mimeType == null ? "" : mimeType.toLowerCase();
            final String encoded = base64Audio == null ? "" : base64Audio;

            if (!(mime.contains("audio/mpeg") || mime.contains("audio/mp3") || mime.contains("audio/wav") || mime.contains("audio/x-wav"))) {
                runOnUiThread(() -> notifyLibcomlair(id, "error", "unsupported-audio-type"));
                return "rejected";
            }
            if (encoded.isEmpty() || encoded.length() > MAX_ENCODED_AUDIO_BYTES * 2) {
                runOnUiThread(() -> notifyLibcomlair(id, "error", "invalid-audio-size"));
                return "rejected";
            }

            try {
                byte[] audioBytes = Base64.decode(encoded, Base64.DEFAULT);
                if (audioBytes.length < 256 || audioBytes.length > MAX_ENCODED_AUDIO_BYTES) {
                    runOnUiThread(() -> notifyLibcomlair(id, "error", "invalid-decoded-audio-size"));
                    return "rejected";
                }

                String suffix = (mime.contains("mpeg") || mime.contains("mp3")) ? ".mp3" : ".wav";
                File file = File.createTempFile("libcomlair_voice_", suffix, getCacheDir());
                try (FileOutputStream output = new FileOutputStream(file)) {
                    output.write(audioBytes);
                    output.flush();
                }

                runOnUiThread(() -> playLibcomlairFile(id, file));
                return "accepted";
            } catch (Exception error) {
                runOnUiThread(() -> notifyLibcomlair(id, "error", error.getClass().getSimpleName()));
                return "rejected";
            }
        }
    }

    private boolean isAllowedLibcomlairAudioPath(String path) {
        return path.startsWith("voice-tests/") && !path.contains("..") && path.endsWith(".wav");
    }

    private void playLibcomlairAsset(String messageId, String relativeAssetPath) {
        releasePlayer(true);
        requestAudioFocus();

        try {
            AssetFileDescriptor afd = getAssets().openFd("www/" + relativeAssetPath);
            MediaPlayer player = createSpeechPlayer(messageId);
            player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();
            player.prepareAsync();
        } catch (Exception error) {
            notifyLibcomlair(messageId, "error", error.getClass().getSimpleName());
            releasePlayer(true);
        }
    }

    private void playLibcomlairFile(String messageId, File file) {
        releasePlayer(true);
        transientAudioFile = file;
        requestAudioFocus();

        try {
            MediaPlayer player = createSpeechPlayer(messageId);
            player.setDataSource(file.getAbsolutePath());
            player.prepareAsync();
        } catch (Exception error) {
            notifyLibcomlair(messageId, "error", error.getClass().getSimpleName());
            releasePlayer(true);
        }
    }

    private MediaPlayer createSpeechPlayer(String messageId) {
        MediaPlayer player = new MediaPlayer();
        mediaPlayer = player;

        AudioAttributes attributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build();

        player.setAudioAttributes(attributes);
        player.setVolume(1.0f, 1.0f);

        player.setOnPreparedListener(mp -> {
            try {
                mp.start();
                notifyLibcomlair(messageId, "speaking", "android-native-audio-adapter");
            } catch (RuntimeException error) {
                notifyLibcomlair(messageId, "error", error.getClass().getSimpleName());
                releasePlayer(true);
            }
        });

        player.setOnCompletionListener(mp -> {
            notifyLibcomlair(messageId, "ended", "android-native-audio-adapter");
            releasePlayer(true);
        });

        player.setOnErrorListener((mp, what, extra) -> {
            notifyLibcomlair(messageId, "error", what + "/" + extra);
            releasePlayer(true);
            return true;
        });

        return player;
    }

    private void notifyLibcomlair(String messageId, String state, String detail) {
        WebView view = webView;
        if (view == null) return;

        String id = JSONObject.quote(messageId == null ? "" : messageId);
        String stateJson = JSONObject.quote(state == null ? "" : state);
        String detailJson = JSONObject.quote(detail == null ? "" : detail);
        String script = "(function(){var d={id:" + id + ",state:" + stateJson + ",detail:" + detailJson + ",source:'android-native'};" +
                "var c=window.LibcomlairAudioCore;if(c&&typeof c.supportEvent==='function'){c.supportEvent(d.id,d.state,d.detail);}" +
                "try{window.dispatchEvent(new CustomEvent('libcomlair-support-audio-status',{detail:d}));}catch(_){}})();";
        view.evaluateJavascript(script, null);
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

        File file = transientAudioFile;
        transientAudioFile = null;
        if (file != null && file.exists()) {
            try { file.delete(); } catch (SecurityException ignored) { }
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
        releasePlayer(true);
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
