package com.watchout.presentation.main

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material3.Text
import com.watchout.presentation.fall_detection.FallDetectionActivity
import com.watchout.presentation.theme.WatchOutTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences("WatchOutPrefs", Context.MODE_PRIVATE)
        val isFirstRun = prefs.getBoolean("isFirstRun", true)

        if (isFirstRun) {
            startActivity(Intent(this, FallDetectionActivity::class.java))
            finish()
        } else {
            setTheme(android.R.style.Theme_DeviceDefault)
            setContent {
                WearApp("WatchOut")
            }
        }
    }
}

@Composable
fun WearApp(greetingName: String) {
    WatchOutTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colors.background),
            contentAlignment = Alignment.Center
        ) {
            TimeText()
            Greeting(greetingName = greetingName)
        }
    }
}

@Composable
fun Greeting(greetingName: String) {
    Text(
        modifier = Modifier.fillMaxWidth(),
        textAlign = TextAlign.Center,
        color = MaterialTheme.colors.primary,
        text = "Hello $greetingName!"
    )
}

@Preview(device = "id:wearos_small_round", showSystemUi = true)
@Composable
fun DefaultPreview() {
    WearApp("Preview Android")
}