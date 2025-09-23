package com.ssafy.watchout.presentation.fallDetection

import android.Manifest
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material3.Text
import com.ssafy.watchout.core.service.TAG
import com.ssafy.watchout.domain.fallDetection.HealthServicesManager
import com.ssafy.watchout.presentation.main.MainActivity
import com.ssafy.watchout.presentation.theme.WatchOutTheme
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
                // 사용자가 권한을 허용하든 거부하든, 선택을 했으므로 최초 실행 상태를 업데이트
                setFirstRunCompleted()
                // 선택 후 메인 액티비티로 이동
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            }

        setContent {
            WatchOutTheme {
                FallDetectionScreen(
                    isRegistered = isRegistered.value,
                    onRegisterClick = {
                        // "등록하기"를 누르면 권한 요청
                        permissionLauncher.launch(Manifest.permission.ACTIVITY_RECOGNITION)
                    },
                    onGoToMainClick = {
                        // "나중에 하기"를 누르면 최초 실행 상태만 업데이트하고 메인으로 이동
                        setFirstRunCompleted()
                        startActivity(Intent(this, MainActivity::class.java))
                        finish()
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

    // SharedPreferences에 '최초 실행 완료'를 기록하는 함수
    private fun setFirstRunCompleted() {
        val prefs = getSharedPreferences("WatchOutPrefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("isFirstRun", false).apply()
    }
}

@Composable
fun FallDetectionScreen(
    isRegistered: Boolean,
    onRegisterClick: () -> Unit,
    onGoToMainClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 1. 안내 문구
        Text(
            text = "낙상 감지 기능으로\n안전을 지키시겠습니까?",
            textAlign = TextAlign.Center,
            style = MaterialTheme.typography.title3
        )

        Spacer(modifier = Modifier.height(24.dp))

        // 2. 버튼들을 좌우로 배치하기 위한 Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // "나중에 하기" 버튼 (왼쪽)
            Button(
                onClick = onGoToMainClick,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color.DarkGray
                ),
                modifier = Modifier.size(ButtonDefaults.SmallButtonSize)
            ) {
                // IconSize 오류가 수정된 부분
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "나중에 하기"
                )
            }

            // "사용하기" 버튼 (오른쪽)
            Button(
                onClick = onRegisterClick,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = MaterialTheme.colors.primary
                ),
                modifier = Modifier.size(ButtonDefaults.DefaultButtonSize)
            ) {
                // IconSize 오류가 수정된 부분
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "사용하기"
                )
            }
        }
    }
}