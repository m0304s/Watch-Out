package com.ssafy.watchout.data.area

import android.util.Log
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object AreaResponse {
    private const val TAG = "AreaRepo"

    @JsonClass(generateAdapter = true)
    data class AreaInfo(
        @Json(name = "areaUuid")    val areaUuid: String? = null,
        @Json(name = "areaName")    val areaName: String? = null,
        @Json(name = "managerUuid") val managerUuid: String? = null,
        @Json(name = "managerName") val managerName: String? = null
    )

    data class DisplayInfo(
        val areaUuid: String,
        val areaName: String,
        val managerUuid: String,
        val managerName: String
    )

    private val _state = MutableStateFlow(
        DisplayInfo(areaUuid = "", areaName = "-", managerUuid = "", managerName = "-")
    )
    val state = _state.asStateFlow()

    private val areaInfoAdapter = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()
        .adapter(AreaInfo::class.java)

    fun updateFromJson(json: String) {
        try {
            val p = areaInfoAdapter.fromJson(json) ?: return
            _state.value = DisplayInfo(
                areaUuid    = p.areaUuid ?: "",
                areaName    = p.areaName ?: "-",
                managerUuid = p.managerUuid ?: "",
                managerName = p.managerName ?: "-"
            )
        } catch (e: Exception) {
            Log.e(TAG, "JSON parse failed: $json", e)
        }
    }
}
