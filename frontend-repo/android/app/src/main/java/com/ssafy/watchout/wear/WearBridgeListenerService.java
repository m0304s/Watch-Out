package com.ssafy.watchout.wear;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;
import com.google.android.gms.wearable.WearableListenerService;

import org.json.JSONObject;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class WearBridgeListenerService extends WearableListenerService {
    private static final String TAG = "WearBridgeListener";
    public static final String ACTION_WATCH_REFRESH = "com.ssafy.watchout.WATCH_REFRESH";

    private final ExecutorService io = Executors.newSingleThreadExecutor();

    @Override
    public void onMessageReceived(MessageEvent e) {
        String path = e.getPath();

        switch (path) {
            case "/area/refresh":
                handleAreaRefresh();
                break;

            default:
                // Log.d(TAG, "ignored path: " + path);
        }
    }

    private void handleAreaRefresh() {
        Intent i = new Intent(ACTION_WATCH_REFRESH);
        sendBroadcast(i);
    }
}
