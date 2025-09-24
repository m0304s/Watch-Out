import { setupFCMListeners, getFCMTokenMobile } from './firebase-mobile'
import { onFCMMessage, getFCMToken } from './firebase'
import { isMobilePlatform } from '@/utils/platform'
import type { FCMPayload } from '@/features/notification/types'
import { emitFCMMessage } from './fcmEventManager'

// 전역 FCM 리스너 관리
let fcmListenersInitialized = false
let unsubscribe: (() => void) | undefined

// 전역 FCM 메시지 핸들러
const globalFCMHandler = (payload: FCMPayload) => {
  console.log('🌍 전역 FCM 메시지 핸들러 호출됨!')
  console.log('🌍 payload:', payload)
  
  // 전역 이벤트 시스템을 통해 모든 구독자에게 메시지 전파
  emitFCMMessage(payload)
}

export const initializeFCMListeners = (handleMessage?: (payload: FCMPayload) => void) => {
  if (fcmListenersInitialized) {
    console.log('⚠️ FCM 리스너가 이미 초기화되어 있습니다.')
    return
  }

  console.log('🔧 전역 FCM 리스너 초기화 시도:', { isMobile: isMobilePlatform() })
  console.log('🔧 플랫폼 상세 정보:', {
    isMobile: isMobilePlatform(),
    isWeb: !isMobilePlatform(),
    userAgent: navigator.userAgent,
    location: window.location.href
  })
  
  if (isMobilePlatform()) {
    console.log('📱 모바일 FCM 리스너 설정 시작...')
    console.log('📱 setupFCMListeners 함수 호출 전')
    
    try {
      unsubscribe = setupFCMListeners(globalFCMHandler)
      console.log('📱 setupFCMListeners 호출 완료')
      console.log('✅ 모바일 FCM 리스너 설정 완료')
      console.log('📱 FCM 리스너 함수:', unsubscribe ? '설정됨' : '설정되지 않음')
      console.log('📱 unsubscribe 타입:', typeof unsubscribe)
    } catch (error) {
      console.error('❌ 모바일 FCM 리스너 설정 실패:', error)
    }
  } else {
    console.log('🌐 웹 FCM 리스너 설정...')
    
    try {
      unsubscribe = onFCMMessage(globalFCMHandler)
      console.log('✅ 웹 FCM 리스너 설정 완료')
      console.log('🌐 FCM 리스너 함수:', unsubscribe ? '설정됨' : '설정되지 않음')
      console.log('🌐 unsubscribe 타입:', typeof unsubscribe)
    } catch (error) {
      console.error('❌ 웹 FCM 리스너 설정 실패:', error)
    }
  }
  
  fcmListenersInitialized = true
  console.log('🎉 FCM 리스너 초기화 완료! fcmListenersInitialized:', fcmListenersInitialized)
}

export const cleanupFCMListeners = () => {
  if (unsubscribe) {
    console.log('🧹 전역 FCM 리스너 정리...')
    unsubscribe()
    unsubscribe = undefined
    fcmListenersInitialized = false
  }
}

export const isFCMListenersInitialized = () => fcmListenersInitialized
