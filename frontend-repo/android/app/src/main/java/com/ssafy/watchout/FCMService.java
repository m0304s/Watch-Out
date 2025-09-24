package com.ssafy.watchout;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.List;
import java.util.Map;

public class FCMService extends FirebaseMessagingService {
    private static final String TAG = "FCMService";
    private static final String CHANNEL_ID = "fcm_data_only";
    private static final String CHANNEL_NAME = "긴급 알림";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        Log.d(TAG, "FCMService 생성됨");
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "🚨🚨🚨 FCM 메시지 수신 🚨🚨🚨");
        Log.d(TAG, "FCM 메시지: " + remoteMessage.toString());
        
        // 앱이 포그라운드에 있는지 확인
        boolean isAppInForeground = isAppInForeground();
        Log.d(TAG, "앱 포그라운드 상태: " + isAppInForeground);
        
        // data-only 메시지 처리
        Map<String, String> data = remoteMessage.getData();
        if (!data.isEmpty()) {
            Log.d(TAG, "📱 data-only 메시지 감지");
            Log.d(TAG, "📱 제목: " + data.get("title"));
            Log.d(TAG, "📱 내용: " + data.get("body"));
            Log.d(TAG, "📱 타입: " + data.get("type"));
            
            if (isAppInForeground) {
                // 포그라운드: Capacitor로 메시지 전달
                Log.d(TAG, "📱 포그라운드 상태 - Capacitor로 메시지 전달 시도");
                sendMessageToCapacitor(data);
            } else {
                // 백그라운드: 로컬 알림 생성
                Log.d(TAG, "📱 백그라운드 상태 - 로컬 알림 생성");
                showNotification(
                    data.get("title") != null ? data.get("title") : "알림",
                    data.get("body") != null ? data.get("body") : "",
                    data
                );
            }
        }
        
        // notification 페이로드가 있는 경우 (하이브리드 메시지)
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "📱 notification 페이로드 포함된 메시지");
            if (!isAppInForeground) {
                showNotification(
                    remoteMessage.getNotification().getTitle(),
                    remoteMessage.getNotification().getBody(),
                    data
                );
            }
        }
    }

    private boolean isAppInForeground() {
        ActivityManager activityManager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> appProcesses = activityManager.getRunningAppProcesses();
        if (appProcesses == null) {
            return false;
        }
        final String packageName = getPackageName();
        for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
            if (appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND 
                && appProcess.processName.equals(packageName)) {
                return true;
            }
        }
        return false;
    }

    private void sendMessageToCapacitor(Map<String, String> data) {
        try {
            Log.d(TAG, "📱 Capacitor Bridge 접근 시도");
            
            // MainActivity에서 Bridge 인스턴스 가져오기
            MainActivity mainActivity = MainActivity.getInstance();
            if (mainActivity != null) {
                Bridge bridge = mainActivity.getBridge();
                if (bridge != null) {
                    Log.d(TAG, "📱 Bridge 찾음 - PushNotifications 플러그인 직접 호출 시도");
                    
                    // JSObject로 데이터 변환
                    JSObject jsData = new JSObject();
                    for (Map.Entry<String, String> entry : data.entrySet()) {
                        jsData.put(entry.getKey(), entry.getValue());
                    }
                    
                    JSObject notification = new JSObject();
                    notification.put("title", data.get("title"));
                    notification.put("body", data.get("body"));
                    notification.put("data", jsData);
                    
                    Log.d(TAG, "📱 전달할 알림 데이터: " + notification.toString());
                    
                    // 방법 1: PushNotifications 플러그인의 pushNotificationReceived 이벤트 직접 트리거
                    try {
                        bridge.triggerJSEvent("pushNotificationReceived", "PushNotifications", notification.toString());
                        Log.d(TAG, "✅ 방법 1: PushNotifications 플러그인 이벤트 트리거 완료");
                    } catch (Exception e1) {
                        Log.w(TAG, "❌ 방법 1 실패: " + e1.getMessage());
                    }
                    
                    // 방법 2: JavaScript CustomEvent 직접 발송
                    try {
                        mainActivity.runOnUiThread(() -> {
                            bridge.getWebView().evaluateJavascript(
                                "window.dispatchEvent(new CustomEvent('capacitor:pushNotificationReceived', { detail: " + notification.toString() + " }));",
                                null
                            );
                        });
                        Log.d(TAG, "✅ 방법 2: CustomEvent 발송 완료");
                    } catch (Exception e2) {
                        Log.w(TAG, "❌ 방법 2 실패: " + e2.getMessage());
                    }
                    
                    // 방법 3: 기존 triggerWindowJSEvent (백업)
                    try {
                        bridge.triggerWindowJSEvent("pushNotificationReceived", notification.toString());
                        Log.d(TAG, "✅ 방법 3: triggerWindowJSEvent 완료");
                    } catch (Exception e3) {
                        Log.w(TAG, "❌ 방법 3 실패: " + e3.getMessage());
                    }
                    
                    Log.d(TAG, "✅ Capacitor로 메시지 전달 완료 (다중 방식)");
                } else {
                    Log.w(TAG, "❌ Bridge가 null입니다");
                }
            } else {
                Log.w(TAG, "❌ MainActivity 인스턴스가 null입니다");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Capacitor 메시지 전달 실패", e);
        }
    }

    private void showNotification(String title, String body, Map<String, String> data) {
        Log.d(TAG, "📱 알림 표시: " + title + " - " + body);
        
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // data를 Intent에 추가
        for (Map.Entry<String, String> entry : data.entrySet()) {
            intent.putExtra(entry.getKey(), entry.getValue());
        }
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            intent, 
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent);

        NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        notificationManager.notify(0, notificationBuilder.build());
        
        Log.d(TAG, "✅ 알림 표시 완료");
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("안전 관련 긴급 알림");
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
            
            Log.d(TAG, "✅ 알림 채널 생성 완료: " + CHANNEL_ID);
        }
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "📱 새로운 FCM 토큰: " + token);
        // 필요시 서버에 토큰 업데이트
    }
}
