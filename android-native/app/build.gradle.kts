plugins {
    id("com.android.application")
}

android {
    namespace = "fr.libcomlair.app"
    compileSdk = 37

    defaultConfig {
        applicationId = "fr.libcomlair.app"
        minSdk = 24
        targetSdk = 37
        versionCode = 1
        versionName = "0.1-native-voice"
    }

    sourceSets {
        getByName("main") {
            // Réutilise la source Vera déjà validée dans le dépôt et l'embarque dans l'APK.
            assets.srcDir("../../voice-tests/fr-FR")
        }
    }

    androidResources {
        noCompress += "wav"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildTypes {
        getByName("debug") {
            isMinifyEnabled = false
        }
        getByName("release") {
            isMinifyEnabled = false
        }
    }
}
