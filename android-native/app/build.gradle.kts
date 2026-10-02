plugins {
    id("com.android.application")
}

android {
    namespace = "fr.libcomlair.app"
    compileSdk = 37

    defaultConfig {
        // Identifiant distinct pour ce prototype afin qu'il puisse être installé à côté de la v0.1.
        applicationId = "fr.libcomlair.app.verav02"
        minSdk = 24
        targetSdk = 37
        versionCode = 2
        versionName = "0.2-native-voice"
    }

    androidResources {
        // MediaPlayer doit pouvoir ouvrir directement la ressource WAV native.
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
