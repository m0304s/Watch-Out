/**
 * FCM 디버깅 유틸리티
 * FCM 알림 수신 문제를 진단하고 해결하는 도구
 */

import { isMobilePlatform, isWebPlatform } from '@/utils/platform'
import { Capacitor } from '@capacitor/core'

export interface FCMDebugInfo {
  platform: 'web' | 'mobile' | 'unknown'
  token: string | null
  permission: string
  listeners: {
    foreground: boolean
    background: boolean
    click: boolean
  }
  serviceWorker: boolean
  capacitor: {
    isNative: boolean
    platform: string
    plugins: string[]
  }
  browser: {
    userAgent: string
    supportsNotifications: boolean
    supportsServiceWorker: boolean
  }
}

class FCMDebugger {
  private static instance: FCMDebugger
  private debugPrefix = '🔍 [FCM Debug]'

  private constructor() {}

  static getInstance(): FCMDebugger {
    if (!FCMDebugger.instance) {
      FCMDebugger.instance = new FCMDebugger()
    }
    return FCMDebugger.instance
  }

  /**
   * FCM 상태 전체 진단
   */
  async diagnoseFCMStatus(): Promise<FCMDebugInfo> {
    const platform = isMobilePlatform()
      ? 'mobile'
      : isWebPlatform()
        ? 'web'
        : 'unknown'

    console.group(`${this.debugPrefix} 🔍 FCM 상태 진단 시작`)

    // 1. 플랫폼 정보
    console.log(`📱 플랫폼: ${platform}`)

    // 2. 토큰 상태
    const token = localStorage.getItem('fcm-token')
    console.log(
      `🔑 FCM 토큰: ${token ? token.substring(0, 20) + '...' : '없음'}`,
    )

    // 3. 권한 상태
    let permission = 'unknown'
    if (platform === 'web') {
      permission = Notification.permission
    } else if (platform === 'mobile') {
      try {
        const { PushNotifications } = await import(
          '@capacitor/push-notifications'
        )
        const permStatus = await PushNotifications.checkPermissions()
        permission = permStatus.receive
      } catch (error) {
        permission = 'error'
      }
    }
    console.log(`🔐 알림 권한: ${permission}`)

    // 4. 리스너 상태 (추정)
    const listeners = {
      foreground: false,
      background: false,
      click: false,
    }

    // 5. Service Worker 상태 (웹만)
    let serviceWorker = false
    if (platform === 'web') {
      serviceWorker = 'serviceWorker' in navigator
      if (serviceWorker) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          serviceWorker = registrations.length > 0
          console.log(`🔧 Service Worker 등록 수: ${registrations.length}`)

          // Firebase Service Worker 확인
          const firebaseSW = registrations.find((reg) =>
            reg.active?.scriptURL?.includes('firebase-messaging-sw.js'),
          )

          if (firebaseSW) {
            console.log('✅ Firebase Service Worker 발견!')
            console.log(`🔧 스코프: ${firebaseSW.scope}`)
            console.log(
              `🔧 활성 상태: ${firebaseSW.active ? '활성' : '비활성'}`,
            )
          } else {
            console.log('❌ Firebase Service Worker를 찾을 수 없습니다')
          }
        } catch (error) {
          console.error('❌ Service Worker 확인 실패:', error)
        }
      }
    }

    // 6. Capacitor 정보 (모바일만)
    const capacitor = {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      plugins: [] as string[],
    }

    if (platform === 'mobile') {
      try {
        await import('@capacitor/push-notifications')
        capacitor.plugins.push('PushNotifications')
      } catch (error) {
        console.error('❌ Capacitor 플러그인 확인 실패:', error)
      }
    }

    // 7. 브라우저 정보
    const browser = {
      userAgent: navigator.userAgent,
      supportsNotifications: 'Notification' in window,
      supportsServiceWorker: 'serviceWorker' in navigator,
    }

    const debugInfo: FCMDebugInfo = {
      platform,
      token,
      permission,
      listeners,
      serviceWorker,
      capacitor,
      browser,
    }

    console.log('📊 진단 결과:', debugInfo)
    console.groupEnd()

    return debugInfo
  }

  /**
   * FCM 토큰 유효성 검사
   */
  validateFCMToken(token: string | null): boolean {
    if (!token) {
      console.error(`${this.debugPrefix} ❌ FCM 토큰이 없습니다`)
      return false
    }

    if (token.length < 100) {
      console.error(
        `${this.debugPrefix} ❌ FCM 토큰이 너무 짧습니다: ${token.length}자`,
      )
      return false
    }

    if (!token.includes(':')) {
      console.error(`${this.debugPrefix} ❌ FCM 토큰 형식이 올바르지 않습니다`)
      return false
    }

    console.log(`${this.debugPrefix} ✅ FCM 토큰이 유효합니다`)
    return true
  }

  /**
   * FCM 메시지 수신 테스트
   */
  async testFCMReception(): Promise<void> {
    console.group(`${this.debugPrefix} 🧪 FCM 수신 테스트`)

    const platform = isMobilePlatform() ? 'mobile' : 'web'

    if (platform === 'web') {
      // 웹에서 FCM 메시지 수신 테스트
      console.log('🌐 웹 FCM 수신 테스트 시작...')

      // Service Worker 상태 확인
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          console.log(`🔧 등록된 Service Worker: ${registrations.length}개`)

          for (const registration of registrations) {
            console.log(`🔧 Service Worker 스코프: ${registration.scope}`)
            console.log(
              `🔧 Service Worker 활성 상태: ${registration.active ? '활성' : '비활성'}`,
            )
          }
        } catch (error) {
          console.error('❌ Service Worker 확인 실패:', error)
        }
      }

      // 알림 권한 확인
      const permission = Notification.permission
      console.log(`🔐 알림 권한: ${permission}`)

      if (permission !== 'granted') {
        console.warn('⚠️ 알림 권한이 허용되지 않았습니다')
      }
    } else if (platform === 'mobile') {
      // 모바일에서 FCM 메시지 수신 테스트
      console.log('📱 모바일 FCM 수신 테스트 시작...')

      try {
        const { PushNotifications } = await import(
          '@capacitor/push-notifications'
        )

        // 권한 확인
        const permStatus = await PushNotifications.checkPermissions()
        console.log(`🔐 푸시 알림 권한: ${permStatus.receive}`)

        if (permStatus.receive !== 'granted') {
          console.warn('⚠️ 푸시 알림 권한이 허용되지 않았습니다')
        }

        // Capacitor 상태 확인
        console.log(
          `📱 Capacitor 네이티브 플랫폼: ${Capacitor.isNativePlatform()}`,
        )
        console.log(`📱 Capacitor 플랫폼: ${Capacitor.getPlatform()}`)
      } catch (error) {
        console.error('❌ 모바일 FCM 테스트 실패:', error)
      }
    }

    console.groupEnd()
  }

  /**
   * FCM 문제 해결 가이드
   */
  provideSolution(debugInfo: FCMDebugInfo): void {
    console.group(`${this.debugPrefix} 💡 문제 해결 가이드`)

    const issues: string[] = []
    const solutions: string[] = []

    // 토큰 문제
    if (!debugInfo.token) {
      issues.push('FCM 토큰이 없습니다')
      solutions.push('FCM 토큰을 다시 등록해주세요')
    } else if (!this.validateFCMToken(debugInfo.token)) {
      issues.push('FCM 토큰이 유효하지 않습니다')
      solutions.push('FCM 토큰을 다시 발급받아주세요')
    }

    // 권한 문제
    if (debugInfo.permission !== 'granted') {
      issues.push('알림 권한이 허용되지 않았습니다')
      if (debugInfo.platform === 'web') {
        solutions.push('브라우저 설정에서 알림을 허용해주세요')
      } else {
        solutions.push('앱 설정에서 알림을 허용해주세요')
      }
    }

    // Service Worker 문제 (웹만)
    if (debugInfo.platform === 'web' && !debugInfo.serviceWorker) {
      issues.push('Service Worker가 등록되지 않았습니다')
      solutions.push(
        'firebase-messaging-sw.js 파일이 루트에 있는지 확인해주세요',
      )
    }

    // Capacitor 문제 (모바일만)
    if (debugInfo.platform === 'mobile' && !debugInfo.capacitor.isNative) {
      issues.push('Capacitor 네이티브 플랫폼이 아닙니다')
      solutions.push('실제 모바일 기기에서 테스트해주세요')
    }

    if (issues.length === 0) {
      console.log('✅ 모든 FCM 설정이 정상입니다')
    } else {
      console.log('❌ 발견된 문제들:')
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`)
      })

      console.log('💡 해결 방법:')
      solutions.forEach((solution, index) => {
        console.log(`${index + 1}. ${solution}`)
      })
    }

    console.groupEnd()
  }

  /**
   * FCM 메시지 수신 강제 테스트
   */
  async forceTestFCMReception(): Promise<void> {
    console.group(`${this.debugPrefix} 🚀 FCM 수신 강제 테스트`)

    // 가짜 FCM 메시지 생성
    const fakeMessage = {
      title: '테스트 알림',
      body: 'FCM 수신 테스트입니다',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    }

    console.log('📨 가짜 FCM 메시지 생성:', fakeMessage)

    // 전역 이벤트 발생
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('fcm-test-message', {
        detail: fakeMessage,
      })
      window.dispatchEvent(event)
      console.log('📡 테스트 이벤트 발생')
    }

    console.groupEnd()
  }

  /**
   * Service Worker 강제 등록
   */
  async forceRegisterServiceWorker(): Promise<boolean> {
    console.group(`${this.debugPrefix} 🔧 Service Worker 강제 등록`)

    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker를 지원하지 않는 브라우저입니다')
      console.groupEnd()
      return false
    }

    try {
      // 기존 Service Worker 해제
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('🗑️ 기존 Service Worker 해제:', registration.scope)
      }

      // Service Worker 등록
      console.log('🔧 Service Worker 등록 시도...')
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        {
          scope: '/',
        },
      )

      console.log('✅ Service Worker 등록 성공!')
      console.log(`🔧 스코프: ${registration.scope}`)
      console.log(`🔧 활성 상태: ${registration.active ? '활성' : '비활성'}`)

      // Service Worker 준비 대기
      await navigator.serviceWorker.ready
      console.log('✅ Service Worker 준비 완료!')

      console.groupEnd()
      return true
    } catch (error) {
      console.error('❌ Service Worker 등록 실패:', error)
      console.groupEnd()
      return false
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const fcmDebugger = FCMDebugger.getInstance()

// 편의 함수들
export const diagnoseFCM = () => fcmDebugger.diagnoseFCMStatus()
export const testFCMReception = () => fcmDebugger.testFCMReception()
export const forceTestFCM = () => fcmDebugger.forceTestFCMReception()
export const forceRegisterSW = () => fcmDebugger.forceRegisterServiceWorker()

// 전역 디버깅 함수 (개발자 도구에서 사용)
if (typeof window !== 'undefined') {
  ;(window as any).fcmDebug = {
    diagnose: diagnoseFCM,
    test: testFCMReception,
    forceTest: forceTestFCM,
    registerSW: forceRegisterSW,
  }
}
