import { Capacitor } from '@capacitor/core'

/**
 * 현재 플랫폼이 네이티브 모바일 환경인지 확인합니다.
 * @returns {boolean} 모바일 앱 환경일 경우 true, 웹 브라우저일 경우 false
 */
export const isMobilePlatform = (): boolean => {
  return Capacitor.isNativePlatform()
}

/**
 * 현재 플랫폼이 웹 환경인지 확인합니다.
 * @returns {boolean} 웹 브라우저 환경일 경우 true, 모바일 앱일 경우 false
 */
export const isWebPlatform = (): boolean => {
  return !Capacitor.isNativePlatform()
}