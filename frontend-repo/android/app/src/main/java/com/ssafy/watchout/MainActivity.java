package com.ssafy.watchout;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugins(new ArrayList<Class<? extends com.getcapacitor.Plugin>>() {{
            add(TokenPlugin.class);
        }});

        super.onCreate(savedInstanceState);
    }
}
