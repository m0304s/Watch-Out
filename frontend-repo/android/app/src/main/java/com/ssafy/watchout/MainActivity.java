package com.ssafy.watchout;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import android.content.Intent;
import java.util.ArrayList;

import com.ssafy.watchout.wear.WearBridgePlugin;
import com.ssafy.watchout.wear.TokenPlugin;

public class MainActivity extends BridgeActivity {
    private static MainActivity instance;
    
    public static MainActivity getInstance() {
        return instance;
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // 워치 통신 플러그인 등록
        registerPlugins(new ArrayList<Class<? extends com.getcapacitor.Plugin>>() {{
            add(TokenPlugin.class);
            add(WearBridgePlugin.class);
        }});

        super.onCreate(savedInstanceState);
        instance = this;
        createNotificationChannels();
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
    }
    
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            
            // 안전장비 위반 알림 채널
            NotificationChannel safetyChannel = new NotificationChannel(
                "safety_violations",
                "안전장비 위반 알림",
                NotificationManager.IMPORTANCE_HIGH
            );
            safetyChannel.setDescription("안전장비 미착용 감지 알림");
            safetyChannel.enableLights(true);
            safetyChannel.enableVibration(true);
            notificationManager.createNotificationChannel(safetyChannel);
            
            // 중장비 진입 알림 채널
            NotificationChannel heavyEquipmentChannel = new NotificationChannel(
                "heavy_equipment",
                "중장비 진입 알림",
                NotificationManager.IMPORTANCE_HIGH
            );
            heavyEquipmentChannel.setDescription("중장비 진입 감지 알림");
            heavyEquipmentChannel.enableLights(true);
            heavyEquipmentChannel.enableVibration(true);
            notificationManager.createNotificationChannel(heavyEquipmentChannel);
            
            // 사고 신고 알림 채널
            NotificationChannel accidentChannel = new NotificationChannel(
                "accident_reports",
                "사고 신고 알림",
                NotificationManager.IMPORTANCE_HIGH
            );
            accidentChannel.setDescription("사고 신고 접수 알림");
            accidentChannel.enableLights(true);
            accidentChannel.enableVibration(true);
            notificationManager.createNotificationChannel(accidentChannel);
            
            // 공지사항 알림 채널
            NotificationChannel announcementChannel = new NotificationChannel(
                "announcements",
                "공지사항",
                NotificationManager.IMPORTANCE_HIGH
            );
            announcementChannel.setDescription("공지사항 및 안내사항");
            announcementChannel.enableLights(true);
            announcementChannel.enableVibration(true);
            notificationManager.createNotificationChannel(announcementChannel);
        }
    }
}
