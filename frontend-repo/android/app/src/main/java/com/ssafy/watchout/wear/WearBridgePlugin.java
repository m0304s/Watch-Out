package com.ssafy.watchout.wear;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.wearable.DataClient;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;

@CapacitorPlugin(name = "WearBridge")
public class WearBridgePlugin extends Plugin {

    private DataClient dataClient;
    private BroadcastReceiver watchRefreshReceiver;

    public static final String ACTION_WATCH_REFRESH = "com.ssafy.watchout.WATCH_REFRESH";

    @Override
    public void load() {
        super.load();
        dataClient = Wearable.getDataClient(getContext());

        IntentFilter f = new IntentFilter(ACTION_WATCH_REFRESH);
        watchRefreshReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                notifyListeners("watchRefresh", null);
            }
        };
        getContext().registerReceiver(watchRefreshReceiver, f, Context.RECEIVER_EXPORTED);
    }

    @Override
    protected void handleOnDestroy() {
        if (watchRefreshReceiver != null) {
            getContext().unregisterReceiver(watchRefreshReceiver);
            watchRefreshReceiver = null;
        }
        super.handleOnDestroy();
    }

    // JS에서 { json: "..." } 형태로 호출
    @PluginMethod
    public void sendAreaInfo(PluginCall call) {
        String json = call.getString("json");
        if (json == null) {
            call.reject("json is required");
            return;
        }
        PutDataMapRequest put = PutDataMapRequest.create("/area/info");
        put.getDataMap().putString("payload", json);
        put.getDataMap().putLong("ts", System.currentTimeMillis());

        dataClient.putDataItem(put.asPutDataRequest())
            .addOnSuccessListener(v -> call.resolve(new JSObject().put("ok", true)))
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }
}
