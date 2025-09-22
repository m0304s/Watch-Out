package com.ssafy.watchout;

import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.ssafy.watchout.wear.WearBridgePlugin;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(com.ssafy.watchout.wear.WearBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }

    public List<Class<? extends Plugin>> getPlugins() {
        List<Class<? extends Plugin>> list = new ArrayList<>();
        list.add(WearBridgePlugin.class);
        return list;
    }
}
