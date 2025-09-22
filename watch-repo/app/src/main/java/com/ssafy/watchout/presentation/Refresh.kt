package com.ssafy.watchout.presentation

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.Wearable
import com.ssafy.watchout.core.WearContract

private const val TAG = "AreaRefresh"

fun requestAreaRefresh(ctx: Context) {
    Wearable.getNodeClient(ctx).connectedNodes
        .addOnSuccessListener { nodes ->
            if (nodes.isEmpty()) return@addOnSuccessListener
            val msgClient = Wearable.getMessageClient(ctx)

            nodes.forEach { node ->
                msgClient.sendMessage(node.id, WearContract.PATH_AREA_REFRESH, null)
                    .addOnFailureListener { e ->
                        Log.e(TAG, "send to ${node.displayName} failed", e)
                    }
                // .addOnSuccessListener { Log.d(TAG, "sent to ${node.displayName}") }
            }
        }
        .addOnFailureListener { e ->
            Log.e(TAG, "connectedNodes failed", e)
        }
}
