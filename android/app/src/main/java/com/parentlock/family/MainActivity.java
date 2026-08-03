package com.parentlock.family;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SettingsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
