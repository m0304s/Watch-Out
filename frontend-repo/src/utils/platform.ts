import { Capacitor } from '@capacitor/core'

export const isMobilePlatform = (): boolean => {
  return Capacitor.isNativePlatform()
}
