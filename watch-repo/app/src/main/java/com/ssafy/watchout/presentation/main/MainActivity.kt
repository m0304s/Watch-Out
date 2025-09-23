package com.ssafy.watchout.presentation.main

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.wear.compose.foundation.pager.HorizontalPager
import androidx.wear.compose.foundation.pager.rememberPagerState
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material3.HorizontalPageIndicator
import androidx.wear.compose.material3.Icon
import androidx.wear.compose.material3.Text
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import com.ssafy.watchout.core.WearContract
import com.ssafy.watchout.core.service.TAG
import com.ssafy.watchout.data.area.AreaResponse
import com.ssafy.watchout.presentation.area.AreaScreen
import com.ssafy.watchout.presentation.fallDetection.FallDetectionActivity
import com.ssafy.watchout.presentation.requestAreaRefresh
import com.ssafy.watchout.presentation.theme.WatchOutTheme
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.max

class MainActivity : ComponentActivity() {

    private val dataHandlers: Map<String, (String) -> Unit> = mapOf(
        WearContract.PATH_AREA_INFO to { json -> AreaResponse.updateFromJson(json) }
    )

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
                WatchOutTheme {
                    PagerScreen()
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        val prefs = getSharedPreferences("WatchOutPrefs", Context.MODE_PRIVATE)
        val isFirstRun = prefs.getBoolean("isFirstRun", true)
        if (!isFirstRun) {
            pullLatestAll()
            requestAreaRefresh(this)
        }
    }

    private fun pullLatestAll() {
        dataHandlers.forEach { (path, handler) ->
            pullLatestOnce(path, handler)
        }
    }

    private fun pullLatestOnce(
        path: String,
        handler: (String) -> Unit
    ) {
        val uri = Uri.Builder().scheme("wear").authority("*").path(path).build()
        Wearable.getDataClient(this).getDataItems(uri)
            .addOnSuccessListener { items ->
                items.lastOrNull()?.let { dataItem ->
                    val map = DataMapItem.fromDataItem(dataItem).dataMap
                    val json = map.getString(WearContract.KEY_PAYLOAD)
                    if (!json.isNullOrEmpty()) handler(json)
                }
                items.release()
            }
            .addOnFailureListener { exception ->
                Log.e(TAG, "데이터를 가져오는데 실패했습니다: $path", exception)
            }
    }
}

@Composable
fun PagerScreen() {
    val pagerState = rememberPagerState(pageCount = { 2 })
    val context = LocalContext.current

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        timeText = { TimeText() },
        positionIndicator = { HorizontalPageIndicator(pagerState = pagerState) }
    ) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize(),
        ) { page ->
            when (page) {
                0 -> AreaScreen()
                1 -> SosScreen(onSosClick = { sendSosMessageToPhone(context) })
            }
        }
    }
}

@Composable
fun SosScreen(onSosClick: () -> Unit) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(targetValue = if (isPressed) 0.95f else 1f, label = "scale")

    val progress = remember { Animatable(0f) }
    val rippleRadius = remember { Animatable(0f) }
    val rippleAlpha = remember { Animatable(1f) }
    val coroutineScope = rememberCoroutineScope()
    var pressJob by remember { mutableStateOf<Job?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1C1C1E)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color(0xFFFF5252).copy(alpha = rippleAlpha.value),
                radius = rippleRadius.value,
                center = center
            )
        }

        Canvas(modifier = Modifier.size(140.dp)) {
            drawArc(
                color = Color.DarkGray,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
            )
            drawArc(
                color = Color(0xFFFF5252),
                startAngle = -90f,
                sweepAngle = 360 * progress.value,
                useCenter = false,
                style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
            )
        }

        Box(
            modifier = Modifier
                .scale(scale)
                .size(120.dp)
                .shadow(8.dp, CircleShape)
                .clip(CircleShape)
                .background(Color(0xFFB00020))
                .pointerInput(Unit) {
                    detectTapGestures(
                        onPress = {
                            isPressed = true
                            pressJob = coroutineScope.launch {
                                progress.animateTo(
                                    targetValue = 1f,
                                    animationSpec = tween(durationMillis = 3000, easing = LinearEasing)
                                )
                                onSosClick()
                                coroutineScope.launch {
                                    val maxRadius = max(size.width, size.height).toFloat()
                                    rippleRadius.animateTo(maxRadius, tween(400))
                                }
                                coroutineScope.launch {
                                    rippleAlpha.animateTo(0f, tween(400))
                                }
                                delay(500)
                                rippleRadius.snapTo(0f)
                                rippleAlpha.snapTo(1f)
                            }
                            tryAwaitRelease()
                            isPressed = false
                            pressJob?.cancel()
                            coroutineScope.launch {
                                progress.animateTo(0f)
                            }
                        }
                    )
                },
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.padding(8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Notifications,
                    contentDescription = "긴급 신고",
                    modifier = Modifier.size(40.dp),
                    tint = Color.White
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "3초간 눌러\n긴급 신고",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp
                )
            }
        }
    }
}

private fun sendSosMessageToPhone(context: Context) {
    Log.d(TAG, "모바일로 수동 SOS 메시지 전송 요청")
    Wearable.getNodeClient(context).connectedNodes.addOnSuccessListener { nodes ->
        if (nodes.isEmpty()) {
            Toast.makeText(context, "연결된 모바일 기기가 없습니다.", Toast.LENGTH_SHORT).show()
            return@addOnSuccessListener
        }
        nodes.firstOrNull()?.let { node ->
            val nodeId = node.id
            val messagePath = WearContract.PATH_SOS_REPORT
            val payload = System.currentTimeMillis().toString().toByteArray()
            Wearable.getMessageClient(context).sendMessage(nodeId, messagePath, payload)
                .addOnSuccessListener {
                    Log.d(TAG, "모바일로 메시지 전송 성공")
                    Toast.makeText(context, "신고가 접수되었습니다.", Toast.LENGTH_SHORT).show()
                }
                .addOnFailureListener {
                    Log.e(TAG, "모바일로 메시지 전송 실패", it)
                    Toast.makeText(context, "신고에 실패했습니다.", Toast.LENGTH_SHORT).show()
                }
        }
    }
}
