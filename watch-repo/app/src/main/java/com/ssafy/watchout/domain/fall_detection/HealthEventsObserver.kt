package com.ssafy.watchout.domain.fall_detection

import androidx.health.services.client.data.HealthEvent
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class HealthEventsObserver {
    private val _events = MutableStateFlow<HealthEvent?>(null)
    val events: StateFlow<HealthEvent?> = _events

    fun onNewEvent(event: HealthEvent) {
        _events.value = event
    }
}