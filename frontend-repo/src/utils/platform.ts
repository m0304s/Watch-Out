import { Capacitor } from '@capacitor/core'

export const isMobilePlatform = (): boolean => {
  // Capacitor가 사용 가능하고 네이티브 플랫폼인지 확인
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('PushNotifications')
}

export const isWebPlatform = (): boolean => {
  return !isMobilePlatform()
}
