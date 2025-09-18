package com.watchout.presentation.fall_detection

import android.Manifest
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.Text
import com.watchout.core.service.TAG
import com.watchout.domain.fall_detection.HealthServicesManager
import com.watchout.presentation.theme.WatchOutTheme
import kotlinx.coroutines.launch

class FallDetectionActivity : ComponentActivity() {

    private lateinit var healthServicesManager: HealthServicesManager
    private val isRegistered = mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        healthServicesManager = HealthServicesManager.getInstance(this)

        val permissionLauncher =
            registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
                if (isGranted) {
                    registerForEvents()
                }
            }

        setContent {
            WatchOutTheme {
                FallDetectionScreen(
                    isRegistered = isRegistered.value,
                    onRegisterClick = {
                        if (isRegistered.value) {
                            unregisterForEvents()
                        } else {
                            permissionLauncher.launch(Manifest.permission.ACTIVITY_RECOGNITION)
                        }
                    }
                )
            }
        }
    }

    private fun registerForEvents() {
        lifecycleScope.launch {
            healthServicesManager.registerForHealthEvents()
            Log.i(TAG, "Registered for fall detection events")
            isRegistered.value = true
        }
    }

    private fun unregisterForEvents() {
        lifecycleScope.launch {
            healthServicesManager.unregisterForHealthEvents()
            Log.i(TAG, "Unregistered for fall detection events")
            isRegistered.value = false
        }
    }
}

@Composable
fun FallDetectionScreen(isRegistered: Boolean, onRegisterClick: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = if (isRegistered) "낙상 감지 기능이 등록되었습니다." else "낙상 감지 기능이 해제되었습니다.",
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRegisterClick) {
            Text(if (isRegistered) "등록 해제" else "등록하기")
        }
    }
}