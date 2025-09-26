import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { initWatchSync } from '@/utils/native/watchSync'
import { syncMyAreaToWatch } from '@/features/device/services/areaWatchSync'

export default function AuthWatchSyncGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)
  const stopRef = useRef<() => void>(() => {})

  useEffect(() => {
    const persistApi = (useAuthStore as any).persist
    const apply = () => {
      stopRef.current()
      stopRef.current = () => {}
      if (isAuthenticated && accessToken) {
        stopRef.current = initWatchSync({ sync: syncMyAreaToWatch })
      }
    }
    if (persistApi?.hasHydrated?.()) apply()
    else persistApi?.onFinishHydration?.(apply)

    return () => {
      stopRef.current()
    }
  }, [isAuthenticated, accessToken])

  return null
}
