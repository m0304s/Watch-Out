package com.ssafy.watchout.core.service

import android.content.Intent
import android.util.Log
import androidx.health.services.client.PassiveListenerService
import androidx.health.services.client.data.DataPointContainer
import androidx.health.services.client.data.HealthEvent
import com.ssafy.watchout.presentation.fall_detection.FallDetectedFeedbackActivity
import kotlinx.coroutines.runBlocking

class PassiveHealthEventService : PassiveListenerService() {

    override fun onHealthEventReceived(event: HealthEvent) {
        runBlocking {
            Log.i(TAG, "Health Event Received: ${event.type}")

            // 수신된 이벤트를 처리하는 로직: UI를 띄운다
            if (event.type == HealthEvent.Type.FALL_DETECTED) {
                val intent = Intent(this@PassiveHealthEventService, FallDetectedFeedbackActivity::class.java).apply {
                    // 서비스에서 Activity를 시작하려면 NEW_TASK 플래그가 필수입니다.
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(intent)
            }
        }
    }

    override fun onNewDataPointsReceived(dataPoints: DataPointContainer) {
    }
}