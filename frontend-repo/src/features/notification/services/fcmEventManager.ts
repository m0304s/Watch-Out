import type { FCMPayload } from '@/features/notification/types'

// FCM 이벤트 타입 정의
export type FCMEventType = 'message-received'

// FCM 이벤트 리스너 타입
export type FCMEventListener = (payload: FCMPayload) => void

// 전역 이벤트 매니저 클래스
class FCMEventManager {
  private listeners: Map<string, Set<FCMEventListener>> = new Map()

  // 이벤트 리스너 등록
  subscribe(eventType: FCMEventType, listener: FCMEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    const eventListeners = this.listeners.get(eventType)!
    eventListeners.add(listener)
    
    console.log(`🎧 FCM 이벤트 리스너 등록: ${eventType}, 현재 리스너 수: ${eventListeners.size}`)
    
    // 구독 해제 함수 반환
    return () => {
      eventListeners.delete(listener)
      console.log(`🎧 FCM 이벤트 리스너 해제: ${eventType}, 남은 리스너 수: ${eventListeners.size}`)
    }
  }

  // 이벤트 발생
  emit(eventType: FCMEventType, payload: FCMPayload): void {
    const eventListeners = this.listeners.get(eventType)
    
    if (!eventListeners || eventListeners.size === 0) {
      console.log(`⚠️ FCM 이벤트 발생했지만 리스너가 없음: ${eventType}`)
      console.log(`⚠️ 현재 등록된 이벤트 타입들:`, Array.from(this.listeners.keys()))
      return
    }
    
    console.log(`📡 FCM 이벤트 발생: ${eventType}, 리스너 수: ${eventListeners.size}`)
    console.log(`📡 FCM 이벤트 payload:`, payload)
    console.log(`📡 FCM 이벤트 발생 시간:`, new Date().toISOString())
    
    // 모든 리스너에게 이벤트 전파
    eventListeners.forEach((listener, index) => {
      try {
        console.log(`📡 FCM 이벤트 리스너 ${index + 1} 호출 중...`)
        console.log(`📡 FCM 이벤트 리스너 ${index + 1} 함수:`, typeof listener)
        listener(payload)
        console.log(`📡 FCM 이벤트 리스너 ${index + 1} 호출 완료`)
      } catch (error) {
        console.error(`❌ FCM 이벤트 리스너 ${index + 1} 호출 실패:`, error)
        if (error instanceof Error) {
          console.error(`❌ 에러 상세:`, error.message)
          console.error(`❌ 에러 스택:`, error.stack)
        }
      }
    })
  }

  // 모든 리스너 제거
  clear(): void {
    this.listeners.clear()
    console.log('🧹 FCM 이벤트 매니저 초기화 완료')
  }

  // 현재 등록된 리스너 수 확인
  getListenerCount(eventType: FCMEventType): number {
    return this.listeners.get(eventType)?.size || 0
  }
}

// 전역 인스턴스 생성
export const fcmEventManager = new FCMEventManager()

// 편의 함수들
export const subscribeToFCMMessages = (listener: FCMEventListener) => {
  return fcmEventManager.subscribe('message-received', listener)
}

export const emitFCMMessage = (payload: FCMPayload) => {
  fcmEventManager.emit('message-received', payload)
}

export const clearFCMEventManager = () => {
  fcmEventManager.clear()
}
