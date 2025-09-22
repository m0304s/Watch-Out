package com.ssafy.watchout.presentation.fall_detection

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.CardDefaults
import androidx.wear.compose.material3.CircularProgressIndicator
import androidx.wear.compose.material3.Icon
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.ProgressIndicatorDefaults
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.contentColorFor
import com.google.android.gms.wearable.Wearable
import com.ssafy.watchout.presentation.main.MainActivity
import com.ssafy.watchout.presentation.theme.WatchOutTheme
import com.ssafy.watchout.core.service.TAG
import kotlinx.coroutines.delay

class FallDetectedFeedbackActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WatchOutTheme {
                WatchRoot(
                    onCancel = { finish() },
                    onReport = { sendDataToPhone() },
                    onDone = {
                        val intent = Intent(this, MainActivity::class.java).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        }
                        startActivity(intent)
                        finish()
                    }
                )
            }
        }
    }

    private fun sendDataToPhone() {
        Log.d(TAG, "폰으로 데이터 전송 요청 실행")
        Wearable.getNodeClient(this).connectedNodes.addOnSuccessListener { nodes ->
            nodes.firstOrNull()?.let { node ->
                val nodeId = node.id
                val messagePath = "/fall-detected"
                val payload = System.currentTimeMillis().toString().toByteArray()
                Wearable.getMessageClient(this).sendMessage(nodeId, messagePath, payload)
                    .addOnSuccessListener { Log.d(TAG, "폰으로 메시지 전송 성공") }
                    .addOnFailureListener { Log.e(TAG, "폰으로 메시지 전송 실패", it) }
            }
        }
    }
}

@Composable
fun WatchRoot(onCancel: () -> Unit, onReport: () -> Unit, onDone: () -> Unit) {
    var currentScreen by remember { mutableStateOf("fall") }

    when (currentScreen) {
        "fall" -> FallDetectedScreen(
            onCancel = onCancel,
            onTimeout = {
                onReport()
                currentScreen = "check"
            }
        )
        "check" -> CheckDoneScreen(onDoneClick = onDone)
    }
}

@Composable
fun CheckDoneScreen(modifier: Modifier = Modifier, onDoneClick: () -> Unit) {

    val backgroundColor = Color(0xFFD32F2F) // 진한 붉은색
    val contentColor = Color.White

    var isVisible by remember { mutableStateOf(false) }
    val animatedScale by animateFloatAsState(
        targetValue = if (isVisible) 1f else 0.3f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "IconScaleAnimation"
    )

    LaunchedEffect(Unit) {
            isVisible = true
    }

    ScreenScaffold(
        modifier = modifier.fillMaxSize(),
        timeText = { TimeText(modifier = Modifier.padding(top = 8.dp)) }
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Card(
                onClick = onDoneClick,
                shape = CircleShape,
                colors = CardDefaults.cardColors(containerColor = backgroundColor),
                modifier = Modifier.size(130.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "신고 완료",
                        tint = contentColor,
                        modifier = Modifier
                            .size(56.dp)
                            .graphicsLayer {
                                scaleX = animatedScale
                                scaleY = animatedScale
                            }
                    )
                }
            }
        }
    }
}
@Composable
fun FallDetectedScreen(
    modifier: Modifier = Modifier,
    totalSeconds: Int = 30,
    onCancel: () -> Unit,
    onTimeout: () -> Unit
) {
    val danger = Color(0xFFB00020)
    val contentColor = contentColorFor(danger)
    var secondsLeft by remember { mutableStateOf(totalSeconds) }

    LaunchedEffect(Unit) {
        while (secondsLeft > 0) {
            delay(1000)
            secondsLeft--
        }
        onTimeout()
    }

    ScreenScaffold(modifier = modifier.fillMaxSize()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(
                progress = { 1f * secondsLeft / totalSeconds },
                strokeWidth = 8.dp,
                modifier = Modifier.fillMaxSize(),
                colors = ProgressIndicatorDefaults.colors(
                    indicatorColor = danger,
                    trackColor = Color.DarkGray
                )
            )
            Card(
                onClick = { /* No-op */ },
                shape = CircleShape,
                colors = CardDefaults.cardColors(
                    containerColor = danger,
                    contentColor = contentColor
                ),
                modifier = Modifier.fillMaxSize(0.85f)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(5.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(text = "낙상 감지됨", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "${secondsLeft}초 내 미응답 시\n관리자가 호출 됩니다",
                        style = MaterialTheme.typography.bodySmall,
                        textAlign = TextAlign.Center,
                        lineHeight = 14.sp
                    )
                    Spacer(Modifier.height(10.dp))
                    Button(
                        onClick = onCancel,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50), // 긍정적인 느낌의 초록색
                            contentColor = Color.White
                        ),
                        modifier = Modifier.height(48.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.ThumbUp,
                                contentDescription = "괜찮아요",
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(Modifier.width(6.dp))
                            Text("괜찮아요")
                        }
                    }
                }
            }
        }
    }
}

@Preview(device = "id:wearos_small_round", showSystemUi = true)
@Composable
fun FallDetectedScreenPreview() {
    WatchOutTheme {
        FallDetectedScreen(onCancel = {}, onTimeout = {})
    }
}

@Preview(device = "id:wearos_small_round", showSystemUi = true)
@Composable
fun CheckDoneScreenPreview() {
    WatchOutTheme {
        CheckDoneScreen(onDoneClick = {})
    }
}
