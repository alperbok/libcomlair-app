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
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

public final class MainActivity extends Activity {
    private static final String LIBCOMLAIR_URL = "file:///android_asset/www/test-v224-master-frame-integration-v2.html?android-app=0.5";

    private WebView webView;
    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;

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
    }

    private boolean isAllowedLibcomlairAudioPath(String path) {
        return path.startsWith("voice-tests/") && !path.contains("..") && path.endsWith(".wav");
    }

    private void playLibcomlairAsset(String messageId, String relativeAssetPath) {
        releasePlayer(true);
        requestAudioFocus();

        try {
            AssetFileDescriptor afd = getAssets().openFd("www/" + relativeAssetPath);
            MediaPlayer player = new MediaPlayer();
            mediaPlayer = player;

            AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();

            player.setAudioAttributes(attributes);
            player.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();
            player.setVolume(1.0f, 1.0f);

            player.setOnPreparedListener(mp -> {
                try {
                    mp.start();
                    notifyLibcomlair(messageId, "speaking", "android-audio-adapter");
                } catch (RuntimeException error) {
                    notifyLibcomlair(messageId, "error", error.getClass().getSimpleName());
                    releasePlayer(true);
                }
            });

            player.setOnCompletionListener(mp -> {
                notifyLibcomlair(messageId, "ended", "android-audio-adapter");
                releasePlayer(true);
            });

            player.setOnErrorListener((mp, what, extra) -> {
                notifyLibcomlair(messageId, "error", what + "/" + extra);
                releasePlayer(true);
                return true;
            });

            player.prepareAsync();
        } catch (Exception error) {
            notifyLibcomlair(messageId, "error", error.getClass().getSimpleName());
            releasePlayer(true);
        }
    }

    private void notifyLibcomlair(String messageId, String state, String detail) {
        WebView view = webView;
        if (view == null) return;

        String script = "(function(){var c=window.LibcomlairAudioCore;" +
                "if(c&&typeof c.supportEvent==='function'){c.supportEvent(" +
                JSONObject.quote(messageId) + "," + JSONObject.quote(state) + "," + JSONObject.quote(detail) + ");}})();";
        view.evaluateJavascript(script, null);
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
        releasePlayer(true);
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
