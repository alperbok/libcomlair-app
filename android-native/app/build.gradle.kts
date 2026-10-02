plugins {
    id("com.android.application")
}

android {
    namespace = "fr.libcomlair.app"
    compileSdk = 37

    defaultConfig {
        applicationId = "fr.libcomlair.app.mobile"
        minSdk = 24
        targetSdk = 37
        versionCode = 4
        versionName = "0.4-local-core-integrated-voice"
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
