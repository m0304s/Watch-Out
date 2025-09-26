package com.ssafy.watchout.wear;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.WearableListenerService;
import com.ssafy.watchout.wear.TokenPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class WearBridgeListenerService extends WearableListenerService {
    private static final String TAG = "AppWearableListener";
    public static final String ACTION_WATCH_REFRESH = "com.ssafy.watchout.WATCH_REFRESH";

    @Override
    public void onMessageReceived(MessageEvent e) {
        String path = e.getPath();
        Log.d(TAG, "Message received with path: " + path);

        switch (path) {
            case "/area/refresh":
                handleAreaRefresh();
                break;
            case "/fall-detected":
                reportAccidentToServer("AUTO_SOS");
                break;
            case "/sos/report":
                reportAccidentToServer("MANUAL_SOS");
                break;
            default:
                // Log.d(TAG, "Ignored path: " + path);
        }
    }

    private void handleAreaRefresh() {
        Intent i = new Intent(ACTION_WATCH_REFRESH);
        sendBroadcast(i);
        Log.d(TAG, "Refresh broadcast sent to the app.");
    }

    /**
     * 서버에 낙상 사고를 신고하는 메소드
     * @param accidentType "AUTO_SOS" (자동) 또는 "MANUAL_SOS" (수동)
     */
    private void reportAccidentToServer(String accidentType) {
        SharedPreferences sharedPreferences = getSharedPreferences(TokenPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String jwtToken = sharedPreferences.getString(TokenPlugin.JWT_KEY, null);

        if (jwtToken == null || jwtToken.isEmpty()) {
            Log.e(TAG, "JWT Token is missing. Cannot report accident.");
            return;
        }

        String serverUrl = "https://j13e102.p.ssafy.io/api" + "/accident";
        
        OkHttpClient client = new OkHttpClient();
        MediaType JSON = MediaType.get("application/json; charset=utf-8");
        JSONObject jsonBody = new JSONObject();

        try {
            jsonBody.put("accidentType", accidentType);
            Log.i(TAG, "accidentType: " + accidentType);
        } catch (JSONException e) {
            Log.e(TAG, "JSON body creation failed", e);
            return;
        }

        RequestBody body = RequestBody.create(jsonBody.toString(), JSON);
        Request request = new Request.Builder()
                .url(serverUrl)
                .addHeader("Authorization", "Bearer " + jwtToken)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "API call to report accident failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    Log.d(TAG, "Accident reported successfully as " + accidentType + ": " + response.body().string());
                } else {
                    Log.e(TAG, "Failed to report accident. Response: " + response.body().string());
                }
            }
        });
    }
}