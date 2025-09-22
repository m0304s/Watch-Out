package com.ssafy.watchout.data

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Node
import com.google.android.gms.wearable.WearableListenerService
import com.ssafy.watchout.core.WearContract
import com.ssafy.watchout.presentation.requestAreaRefresh

class AreaDataService : WearableListenerService() {

    override fun onPeerConnected(peer: Node) {
        requestAreaRefresh(this)
    }

    override fun onDataChanged(buffer: DataEventBuffer) {
        buffer.forEach { e ->
            if (e.type != DataEvent.TYPE_CHANGED) return@forEach
            when (e.dataItem.uri.path) {
                WearContract.PATH_AREA_INFO -> {
                    val json = DataMapItem.fromDataItem(e.dataItem)
                        .dataMap.getString(WearContract.KEY_PAYLOAD)
                    if (!json.isNullOrEmpty()) {
                        AreaResponse.updateFromJson(json)
                    }
                }
            }
        }
    }
}
