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
        versionCode = 6
        versionName = "0.6-azure-native-autostart"
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
