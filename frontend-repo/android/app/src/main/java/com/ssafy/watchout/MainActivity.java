package com.ssafy.watchout;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import com.ssafy.watchout.wear.WearBridgePlugin;
import com.ssafy.watchout.wear.TokenPlugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugins(new ArrayList<Class<? extends com.getcapacitor.Plugin>>() {{
            add(TokenPlugin.class);
            add(WearBridgePlugin.class);
        }});

        super.onCreate(savedInstanceState);
    }
}
