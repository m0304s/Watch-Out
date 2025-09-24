package com.ssafy.watchout.core.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.ssafy.watchout.R
import com.ssafy.watchout.presentation.fallDetection.FallDetectedFeedbackActivity

class FallDetectionService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.i(TAG, "FallDetectionService started.")

        val channelId = "fall_detection_foreground_channel"
        createNotificationChannel(channelId)

        // 1. 포그라운드 서비스를 위한 기본 알림 (사용자에게 거의 보이지 않음)
        val foregroundNotification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("낙상 감지 시스템 작동 중")
            .setSmallIcon(R.drawable.splash_icon)
            .build()

        // 2. 서비스를 포그라운드 상태로 만듦
        startForeground(FOREGROUND_SERVICE_ID, foregroundNotification)

        // 3. ⭐ 실제 화면을 띄울 전체 화면 알림 생성 및 표시
        showFullScreenNotification()

        // 4. 할 일을 마쳤으므로 서비스 스스로 종료
        stopSelf()

        return START_NOT_STICKY
    }

    private fun showFullScreenNotification() {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val fullScreenChannelId = "fall_detection_fullscreen_channel"
        createNotificationChannel(fullScreenChannelId, NotificationManager.IMPORTANCE_HIGH)

        val fullScreenIntent = Intent(this, FallDetectedFeedbackActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val fullScreenPendingIntent = PendingIntent.getActivity(
            this,
            FULL_SCREEN_REQUEST_CODE,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val fullScreenNotification = NotificationCompat.Builder(this, fullScreenChannelId)
            .setSmallIcon(R.drawable.splash_icon)
            .setContentTitle("낙상 감지됨")
            .setContentText("화면을 확인해주세요. 미응답 시 자동 신고됩니다.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(fullScreenPendingIntent, true) // 핵심
            .setAutoCancel(true)
            .build()

        notificationManager.notify(FULL_SCREEN_NOTIFICATION_ID, fullScreenNotification)
        Log.i(TAG, "Full-screen notification has been sent.")
    }

    private fun createNotificationChannel(channelId: String, importance: Int = NotificationManager.IMPORTANCE_DEFAULT) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (notificationManager.getNotificationChannel(channelId) == null) {
                val channel = NotificationChannel(channelId, "낙상 감지", importance)
                notificationManager.createNotificationChannel(channel)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    companion object {
        private const val FOREGROUND_SERVICE_ID = 111
        private const val FULL_SCREEN_NOTIFICATION_ID = 112
        private const val FULL_SCREEN_REQUEST_CODE = 113
    }
}