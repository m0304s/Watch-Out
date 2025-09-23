package com.ssafy.watchout.wear;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Token")
public class TokenPlugin extends Plugin {

    // 토큰을 저장할 파일 이름과 키를 상수로 정의
    public static final String PREFS_NAME = "WatchoutPrefs";
    public static final String JWT_KEY = "jwt_token";

    @PluginMethod
    public void saveToken(PluginCall call) {
        String token = call.getString("token");

        if (token == null || token.isEmpty()) {
            call.reject("Token is missing or empty");
            return;
        }

        SharedPreferences sharedPreferences = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(JWT_KEY, token);
        editor.apply();

        call.resolve();
    }
}
