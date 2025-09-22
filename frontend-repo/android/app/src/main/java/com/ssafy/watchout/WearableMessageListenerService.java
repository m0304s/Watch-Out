package com.ssafy.watchout;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.WearableListenerService;
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

public class WearableMessageListenerService extends WearableListenerService {

    private static final String TAG = "WearableListener";
    private static final String FALL_DETECTED_PATH = "/fall-detected"; // 워치 앱과 동일한 경로

    @Override
    public void onMessageReceived(MessageEvent messageEvent) {
        if (messageEvent.getPath().equals(FALL_DETECTED_PATH)) {
            Log.d(TAG, "Fall detected message received from watch. Reporting to server...");
            reportAccidentToServer();
        } else {
            super.onMessageReceived(messageEvent);
        }
    }

    private void reportAccidentToServer() {
        SharedPreferences sharedPreferences = getSharedPreferences(TokenPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String jwtToken = sharedPreferences.getString(TokenPlugin.JWT_KEY, null);

        if (jwtToken == null || jwtToken.isEmpty()) {
            Log.e(TAG, "JWT 토큰이 없습니다. 사고 신고 불가합니다.");
            return;
        }

        String serverUrl = BuildConfig.API_BASE_URL + "/accident";

        OkHttpClient client = new OkHttpClient();
        MediaType JSON = MediaType.get("application/json; charset=utf-8");

        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("accidentType", "AUTO_SOS");
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
                Log.e(TAG, "API call failed", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    Log.d(TAG, "Accident reported successfully: " + response.body().string());
                } else {
                    Log.e(TAG, "Failed to report accident. Response: " + response.body().string());
                }
            }
        });
    }
}