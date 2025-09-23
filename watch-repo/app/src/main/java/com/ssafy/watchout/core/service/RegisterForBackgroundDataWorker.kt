package com.ssafy.watchout.core.service

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.ssafy.watchout.domain.fallDetection.HealthServicesManager

class RegisterForBackgroundDataWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {
    override suspend fun doWork(): Result {
        HealthServicesManager.getInstance(applicationContext).registerForHealthEvents()
        return Result.success()
    }
}