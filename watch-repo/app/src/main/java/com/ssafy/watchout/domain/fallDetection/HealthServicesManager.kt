package com.ssafy.watchout.domain.fallDetection

import android.content.Context
import android.util.Log
import androidx.concurrent.futures.await
import androidx.health.services.client.HealthServices
import androidx.health.services.client.HealthServicesClient
import androidx.health.services.client.data.HealthEvent // 🚨 HealthEvent를 import
import androidx.health.services.client.data.PassiveListenerConfig
import com.ssafy.watchout.core.di.SingletonHolder
import com.ssafy.watchout.core.service.PassiveHealthEventService
import com.ssafy.watchout.core.service.TAG

class HealthServicesManager(context: Context) {
    private var healthServicesClient: HealthServicesClient = HealthServices.getClient(context)


    private val healthEventTypes = setOf(HealthEvent.Type.FALL_DETECTED)

    suspend fun registerForHealthEvents() {
        Log.i(TAG, "Registering listener")
        val passiveListenerConfig = PassiveListenerConfig.builder()
            .setHealthEventTypes(healthEventTypes)
            .build()

        healthServicesClient.passiveMonitoringClient.setPassiveListenerServiceAsync(
            PassiveHealthEventService::class.java,
            passiveListenerConfig
        ).await()
    }

    suspend fun unregisterForHealthEvents() {
        Log.i(TAG, "Unregistering listeners")
        healthServicesClient.passiveMonitoringClient.clearPassiveListenerServiceAsync().await()
    }

    companion object :
        SingletonHolder<HealthServicesManager, Context>(::HealthServicesManager)
}