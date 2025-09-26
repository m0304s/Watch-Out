/**
 * FCM 알림 로깅 유틸리티
 * 웹/모바일 플랫폼별로 통합된 FCM 메시지 로깅을 제공합니다.
 */

import { isMobilePlatform, isWebPlatform } from '@/utils/platform'

export interface FCMLogData {
  platform: 'web' | 'mobile'
  messageType: 'foreground' | 'background' | 'click'
  payload: any
  timestamp: string
  title?: string
  body?: string
  data?: Record<string, any>
}

class FCMLogger {
  private static instance: FCMLogger
  private logPrefix = '🔔 [FCM]'

  private constructor() {}

  static getInstance(): FCMLogger {
    if (!FCMLogger.instance) {
      FCMLogger.instance = new FCMLogger()
    }
    return FCMLogger.instance
  }

  /**
   * FCM 메시지 수신 로그
   */
  logMessageReceived(
    payload: any,
    messageType: 'foreground' | 'background' | 'click' = 'foreground',
  ): void {
    const platform = isMobilePlatform() ? 'mobile' : 'web'
    const timestamp = new Date().toISOString()

    const logData: FCMLogData = {
      platform,
      messageType,
      payload,
      timestamp,
      title:
        payload?.title || payload?.notification?.title || payload?.data?.title,
      body: payload?.body || payload?.notification?.body || payload?.data?.body,
      data: payload?.data,
    }

    // 메인 로그
    console.group(`${this.logPrefix} 📨 알림 수신 (${platform.toUpperCase()})`)
    console.log(`⏰ 시간: ${timestamp}`)
    console.log(`📱 플랫폼: ${platform}`)
    console.log(`🔄 타입: ${messageType}`)
    console.log(`📋 제목: ${logData.title || 'N/A'}`)
    console.log(`📝 내용: ${logData.body || 'N/A'}`)

    // 데이터 상세 정보
    if (logData.data && Object.keys(logData.data).length > 0) {
      console.log(`📦 데이터:`, logData.data)
    }

    // 원본 페이로드
    console.log(`🔍 원본 페이로드:`, payload)
    console.groupEnd()

    // 추가 상세 로그
    this.logDetailedInfo(logData)
  }

  /**
   * FCM 토큰 관련 로그
   */
  logToken(
    token: string,
    action: 'registered' | 'removed' | 'refreshed',
  ): void {
    const platform = isMobilePlatform()
      ? 'mobile'
      : isWebPlatform()
        ? 'web'
        : 'unknown'
    const timestamp = new Date().toISOString()

    console.group(
      `${this.logPrefix} 🔑 토큰 ${action} (${platform.toUpperCase()})`,
    )
    console.log(`⏰ 시간: ${timestamp}`)
    console.log(`📱 플랫폼: ${platform}`)
    console.log(`🔑 토큰: ${token.substring(0, 20)}...`)
    console.log(`📏 토큰 길이: ${token.length}`)
    console.groupEnd()
  }

  /**
   * FCM 에러 로그
   */
  logError(error: Error, context: string): void {
    const platform = isMobilePlatform()
      ? 'mobile'
      : isWebPlatform()
        ? 'web'
        : 'unknown'
    const timestamp = new Date().toISOString()

    console.group(`${this.logPrefix} ❌ 에러 발생 (${platform.toUpperCase()})`)
    console.error(`⏰ 시간: ${timestamp}`)
    console.error(`📱 플랫폼: ${platform}`)
    console.error(`📍 컨텍스트: ${context}`)
    console.error(`❌ 에러 메시지: ${error.message}`)
    console.error(`📋 에러 스택:`, error.stack)
    console.groupEnd()
  }

  /**
   * FCM 권한 관련 로그
   */
  logPermission(
    status: string,
    action: 'requested' | 'granted' | 'denied',
  ): void {
    const platform = isMobilePlatform()
      ? 'mobile'
      : isWebPlatform()
        ? 'web'
        : 'unknown'
    const timestamp = new Date().toISOString()

    console.group(
      `${this.logPrefix} 🔐 권한 ${action} (${platform.toUpperCase()})`,
    )
    console.log(`⏰ 시간: ${timestamp}`)
    console.log(`📱 플랫폼: ${platform}`)
    console.log(`🔐 권한 상태: ${status}`)
    console.groupEnd()
  }

  /**
   * 상세 정보 로그
   */
  private logDetailedInfo(logData: FCMLogData): void {
    // 메시지 타입별 상세 로그
    if (logData.data?.type) {
      console.log(`${this.logPrefix} 🏷️ 메시지 타입: ${logData.data.type}`)
    }

    // 이미지가 있는 경우
    if (logData.data?.image) {
      console.log(`${this.logPrefix} 🖼️ 이미지 URL: ${logData.data.image}`)
    }

    // 액션 버튼이 있는 경우
    if (logData.data?.actions) {
      console.log(`${this.logPrefix} 🔘 액션 버튼:`, logData.data.actions)
    }

    // 우선순위가 있는 경우
    if (logData.data?.priority) {
      console.log(`${this.logPrefix} ⚡ 우선순위: ${logData.data.priority}`)
    }

    // 만료 시간이 있는 경우
    if (logData.data?.ttl) {
      console.log(`${this.logPrefix} ⏳ TTL: ${logData.data.ttl}초`)
    }
  }

  /**
   * FCM 초기화 로그
   */
  logInitialization(
    platform: string,
    success: boolean,
    details?: string,
  ): void {
    const timestamp = new Date().toISOString()
    const status = success ? '✅ 성공' : '❌ 실패'

    console.group(
      `${this.logPrefix} 🚀 초기화 ${status} (${platform.toUpperCase()})`,
    )
    console.log(`⏰ 시간: ${timestamp}`)
    console.log(`📱 플랫폼: ${platform}`)
    console.log(`🎯 상태: ${status}`)
    if (details) {
      console.log(`📋 상세: ${details}`)
    }
    console.groupEnd()
  }

  /**
   * FCM 리스너 등록 로그
   */
  logListenerRegistration(listenerType: string, success: boolean): void {
    const platform = isMobilePlatform()
      ? 'mobile'
      : isWebPlatform()
        ? 'web'
        : 'unknown'
    const timestamp = new Date().toISOString()
    const status = success ? '✅ 등록됨' : '❌ 실패'

    console.group(
      `${this.logPrefix} 👂 리스너 ${status} (${platform.toUpperCase()})`,
    )
    console.log(`⏰ 시간: ${timestamp}`)
    console.log(`📱 플랫폼: ${platform}`)
    console.log(`🎧 리스너 타입: ${listenerType}`)
    console.log(`🎯 상태: ${status}`)
    console.groupEnd()
  }
}

// 싱글톤 인스턴스 내보내기
export const fcmLogger = FCMLogger.getInstance()

// 편의 함수들
export const logFCMessage = (
  payload: any,
  messageType?: 'foreground' | 'background' | 'click',
) => {
  fcmLogger.logMessageReceived(payload, messageType)
}

export const logFCMToken = (
  token: string,
  action: 'registered' | 'removed' | 'refreshed',
) => {
  fcmLogger.logToken(token, action)
}

export const logFCMError = (error: Error, context: string) => {
  fcmLogger.logError(error, context)
}

export const logFCMPermission = (
  status: string,
  action: 'requested' | 'granted' | 'denied',
) => {
  fcmLogger.logPermission(status, action)
}

export const logFCMInit = (
  platform: string,
  success: boolean,
  details?: string,
) => {
  fcmLogger.logInitialization(platform, success, details)
}

export const logFCMListener = (listenerType: string, success: boolean) => {
  fcmLogger.logListenerRegistration(listenerType, success)
}
