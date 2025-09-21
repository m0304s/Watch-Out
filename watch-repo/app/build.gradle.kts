plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.watchout"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.ssafy.watchout"
        minSdk = 30
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }

    buildFeatures { compose = true }
}

dependencies {
    // 워치-폰/워치 간 데이터 통신
    implementation("com.google.android.gms:play-services-wearable:18.1.0")
    // Wear 핵심(UI 위젯 등) - 이건 M3와 별개로 필요할 수 있습니다.
    implementation("androidx.wear:wear:1.3.0")

    // 기본 Compose 설정
    implementation(platform(libs.compose.bom))
    implementation(libs.ui)
    implementation(libs.ui.graphics)
    implementation(libs.ui.tooling.preview)
    implementation(libs.activity.compose)
    debugImplementation(libs.ui.tooling) // 기본 Compose 프리뷰

    // ===============================================================
    // Wear Compose Material3 (1.5.0 버전으로 교체)
    // ===============================================================
    implementation("androidx.compose.material3:material3:1.2.1")
    // For Wear Material Design UX guidelines and specifications
    implementation("androidx.wear.compose:compose-material3:1.5.0")
    // For integration between Wear Compose and Androidx Navigation libraries
    implementation("androidx.wear.compose:compose-navigation:1.5.0")
    // For Wear preview annotations
    debugImplementation("androidx.wear.compose:compose-ui-tooling:1.5.0")

    implementation("androidx.compose.material:material-icons-extended-android:1.6.7")
    // ===============================================================

    // 스플래시 스크린
    implementation("androidx.core:core-splashscreen:1.0.1")

    // 테스트 관련
    androidTestImplementation(platform(libs.compose.bom))
    androidTestImplementation(libs.ui.test.junit4)
    debugImplementation(libs.ui.test.manifest)

    // Health Services
    implementation("androidx.health:health-services-client:1.0.0-beta01")

    // WorkManager for background tasks
    implementation("androidx.work:work-runtime-ktx:2.7.1")

    // Lifecycle components
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.5.1")
    implementation("androidx.lifecycle:lifecycle-service:2.5.1")

    // Guava (Health Services에 필요)
    implementation("com.google.guava:guava:30.1.1-android")
    implementation("androidx.concurrent:concurrent-futures-ktx:1.1.0")
}