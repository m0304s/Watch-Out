package com.ssafy.watchout.presentation.main

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import com.ssafy.watchout.core.WearContract
import com.ssafy.watchout.data.AreaResponse
import com.ssafy.watchout.presentation.area.AreaScreen
import com.ssafy.watchout.presentation.requestAreaRefresh
import com.ssafy.watchout.presentation.theme.WatchOutTheme

class MainActivity : ComponentActivity() {

    private val dataHandlers: Map<String, (String) -> Unit> = mapOf(
        WearContract.PATH_AREA_INFO to { json -> AreaResponse.updateFromJson(json) }
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { WatchOutTheme { AreaScreen() } }
    }

    override fun onStart() {
        super.onStart()
        pullLatestAll()
        requestAreaRefresh(this)
    }

    private fun pullLatestAll() {
        dataHandlers.forEach { (path, handler) ->
            pullLatestOnce(path, handler)
        }
    }

    private fun pullLatestOnce(
        path: String,
        handler: (String) -> Unit
    ) {
        val uri = Uri.Builder().scheme("wear").authority("*").path(path).build()
        Wearable.getDataClient(this).getDataItems(uri).addOnSuccessListener { items ->
            if (items.count > 0) {
                val map = DataMapItem.fromDataItem(items[0]).dataMap
                val json = map.getString(WearContract.KEY_PAYLOAD)
                if (!json.isNullOrEmpty()) handler(json)
            }
            items.release()
        }
    }
}