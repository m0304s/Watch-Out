package com.ssafy.watchout.presentation.main

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import com.ssafy.watchout.core.WearContract
import com.ssafy.watchout.presentation.area.AreaScreen
import com.ssafy.watchout.data.area.AreaResponse
import com.ssafy.watchout.presentation.fall_detection.FallDetectionActivity
import com.ssafy.watchout.presentation.requestAreaRefresh
import com.ssafy.watchout.presentation.theme.WatchOutTheme

class MainActivity : ComponentActivity() {

    private val dataHandlers: Map<String, (String) -> Unit> = mapOf(
        WearContract.PATH_AREA_INFO to { json -> AreaResponse.updateFromJson(json) }
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen() // 스플래시 스크린 적용
        super.onCreate(savedInstanceState)

        // 최초 실행 여부 확인
        val prefs = getSharedPreferences("WatchOutPrefs", Context.MODE_PRIVATE)
        val isFirstRun = prefs.getBoolean("isFirstRun", true)

        if (isFirstRun) {
            // 최초 실행이면 FallDetectionActivity로 이동
            startActivity(Intent(this, FallDetectionActivity::class.java))
            finish()
        } else {
            // 최초 실행이 아니면 기존 AreaScreen 표시
            setTheme(android.R.style.Theme_DeviceDefault)
            setContent {
                WatchOutTheme { AreaScreen() }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        // onStart는 최초 실행이 아닐 때만 호출되므로, 여기서 데이터 로직을 실행
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
        Wearable.getDataClient(this).getDataItems(uri).addOnSuccessListener { items ->
            if (items.count > 0) {
                val map = DataMapItem.fromDataItem(items[0]).dataMap
                val json = map.getString(WearContract.KEY_PAYLOAD)
                if (!json.isNullOrEmpty()) handler(json)
            }
            items.release()
        }
    }
}