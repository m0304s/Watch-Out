package com.ssafy.watchout.core.service

import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.health.services.client.PassiveListenerService
import androidx.health.services.client.data.DataPointContainer
import androidx.health.services.client.data.HealthEvent

class PassiveHealthEventService : PassiveListenerService() {

    override fun onHealthEventReceived(event: HealthEvent) {
        if (event.type == HealthEvent.Type.FALL_DETECTED) {
            Log.i(TAG, "Fall detected! Starting FallDetectionService.")

            // 직접 알림을 보내는 대신, FallDetectionService를 시작시킨다.
            val serviceIntent = Intent(this, FallDetectionService::class.java)

            // 안드로이드 버전에 맞춰 서비스를 시작
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
            } else {
                startService(serviceIntent)
            }
        }
    }

    override fun onNewDataPointsReceived(dataPoints: DataPointContainer) {
        // Not used in this project
    }
}