import { initializeApp } from 'firebase/app'
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type Messaging,
} from 'firebase/messaging'
import {
  firebaseConfig,
  vapidKey,
} from '@/features/notification/config/firebase-config'
import type { FCMPayload } from '@/features/notification/types'
import { isWebPlatform } from '@/utils/platform'
import {
  logFCMessage,
  logFCMToken,
  logFCMError,
  logFCMPermission,
  logFCMInit,
  logFCMListener,
} from '@/utils/fcmLogger'

// Firebase 초기화 (웹에서만)
let app: any
let messaging: Messaging

if (isWebPlatform()) {
  try {
    app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
    logFCMInit('web', true, 'Firebase 앱 및 메시징 초기화 완료')
  } catch (error) {
    logFCMInit(
      'web',
      false,
      error instanceof Error ? error.message : '알 수 없는 오류',
    )
    console.warn('Firebase 초기화 실패 (웹 환경이 아닐 수 있음):', error)
  }
}

export { messaging }

// FCM 토큰 발급
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // 웹 플랫폼이 아니면 null 반환
    if (!isWebPlatform()) {
      console.log('웹 플랫폼이 아니므로 FCM 토큰 발급을 건너뜁니다.')
      return null
    }

    // 환경 체크
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      throw new Error('FCM은 HTTPS 환경에서만 작동합니다.')
    }

    // 브라우저 지원 여부 확인
    const supported = await isSupported().catch(() => false)
    if (!supported) {
      throw new Error('현재 브라우저는 FCM 웹 푸시를 지원하지 않습니다.')
    }

    if (!messaging) {
      throw new Error('Firebase Messaging이 초기화되지 않았습니다.')
    }

    // 알림 권한 확인
    let permission = Notification.permission

    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    if (permission !== 'granted') {
      logFCMPermission(permission, 'denied')
      throw new Error('알림 권한이 필요합니다.')
    }

    logFCMPermission(permission, 'granted')

    // Service Worker 준비 (루트 스코프의 firebase-messaging-sw.js만 사용)
    let swRegistration: ServiceWorkerRegistration | undefined
    if ('serviceWorker' in navigator) {
      try {
        console.log('🔧 Service Worker 등록 시작...')

        // 기존 등록된 Service Worker 확인
        const sws = await navigator.serviceWorker.getRegistrations()
        console.log(`🔧 기존 Service Worker 등록 수: ${sws.length}`)

        const rootScope = `${location.origin}/`
        // 1순위: 루트 스코프
        swRegistration = sws.find((r) => r.scope === rootScope)
        // 2순위: 스크립트 URL에 파일명 포함
        if (!swRegistration) {
          swRegistration = sws.find((r) =>
            (r.active as any)?.scriptURL?.includes('firebase-messaging-sw.js'),
          )
        }

        if (!swRegistration) {
          console.log('🔧 Service Worker 등록 시도...')
          // 루트 스코프로 명시 등록
          swRegistration = await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js',
            {
              scope: '/',
            },
          )
          console.log('✅ Service Worker 등록 성공!')
        } else {
          console.log('✅ 기존 Service Worker 발견!')
        }

        // ready 보장
        swRegistration = await navigator.serviceWorker.ready
        console.log('🔧 Service Worker 준비 완료!')

        // 기존 푸시 구독이 꼬였을 수 있으므로 해제 후 재시도 대비
        try {
          const existingSub = await swRegistration.pushManager.getSubscription()
          if (existingSub) {
            console.log('🔧 기존 푸시 구독 해제...')
            await existingSub.unsubscribe()
          }
        } catch (unsubError) {
          console.warn('⚠️ 푸시 구독 해제 실패:', unsubError)
        }
      } catch (swError) {
        console.error('❌ Service Worker 등록 실패:', swError)
        throw new Error(
          'Service Worker 등록에 실패했습니다: ' + swError.message,
        )
      }
    } else {
      throw new Error('현재 브라우저는 Service Worker를 지원하지 않습니다.')
    }

    // FCM 토큰 발급 (재시도 로직 포함)
    let token: string | null = null
    let retryCount = 0
    const maxRetries = 3

    while (!token && retryCount < maxRetries) {
      try {
        // Service Worker가 준비되었는지 확인
        if ('serviceWorker' in navigator) {
          try {
            if (!swRegistration)
              swRegistration = await navigator.serviceWorker.ready
          } catch (swReadyError) {
            // 무시
          }
        }

        // FCM 토큰 발급
        token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: swRegistration,
        })

        if (token) {
          break
        } else {
          retryCount++
        }
      } catch (tokenError) {
        retryCount++

        if (retryCount < maxRetries) {
          const delay = 1000 * retryCount
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    if (!token) {
      throw new Error(
        'FCM 토큰 발급에 실패했습니다. 네트워크 연결과 브라우저 설정을 확인해주세요.',
      )
    }

    logFCMToken(token, 'registered')
    return token
  } catch (error) {
    // 에러 로깅
    if (error instanceof Error) {
      logFCMError(error, 'FCM 토큰 발급')

      if (error.message.includes('Registration failed')) {
        throw new Error(
          'FCM 등록에 실패했습니다. HTTPS 환경에서 접속하고 브라우저를 새로고침해주세요.',
        )
      } else if (error.name === 'AbortError') {
        throw new Error(
          'FCM 등록이 중단되었습니다. 브라우저를 새로고침하고 다시 시도해주세요.',
        )
      } else if (error.message.includes('messaging/unsupported-browser')) {
        throw new Error(
          '현재 브라우저는 FCM을 지원하지 않습니다. Chrome, Firefox, Safari 최신 버전을 사용해주세요.',
        )
      } else if (
        error.message.includes('messaging/failed-service-worker-registration')
      ) {
        throw new Error(
          'Service Worker 등록에 실패했습니다. 브라우저 캐시를 삭제하고 다시 시도해주세요.',
        )
      } else if (error.message.includes('messaging/invalid-vapid-key')) {
        throw new Error(
          'VAPID Key가 유효하지 않습니다. Firebase Console에서 올바른 VAPID Key를 확인해주세요.',
        )
      }
    }

    throw error
  }
}

// FCM 메시지 수신
export const onFCMMessage = (callback: (payload: FCMPayload) => void) => {
  if (!isWebPlatform() || !messaging) {
    console.log(
      '웹 플랫폼이 아니거나 Firebase Messaging이 초기화되지 않았습니다.',
    )
    return () => {} // 빈 함수 반환
  }

  logFCMListener('웹 포그라운드 메시지', true)

  const unsubscribe = onMessage(messaging, (payload) => {
    // 통합된 FCM 로깅 시스템 사용
    logFCMessage(payload, 'foreground')

    try {
      // 웹 FCM 메시지 데이터 구조 변환
      const processedPayload = {
        ...payload,
        // title과 body를 data에서 우선 가져오기
        title: payload.data?.title || payload.notification?.title,
        body: payload.data?.body || payload.notification?.body,
        // notification 객체도 업데이트
        notification: payload.notification
          ? {
              ...payload.notification,
              title: payload.data?.title || payload.notification?.title,
              body: payload.data?.body || payload.notification?.body,
            }
          : undefined,
      }

      // callback 함수 호출 전에 한 번 더 확인
      if (typeof callback === 'function') {
        callback(processedPayload)
      } else {
        console.error('❌ 웹 FCM callback 함수가 유효하지 않습니다!', callback)
      }
    } catch (error) {
      if (error instanceof Error) {
        logFCMError(error, '웹 FCM 메시지 처리')
      }
    }
  })

  return unsubscribe
}

// 알림 권한 상태 확인
export const getNotificationPermission = () => {
  return Notification.permission
}

// 알림 권한 재설정 안내
export const showNotificationPermissionGuide = () => {
  const permission = Notification.permission

  if (permission === 'denied') {
    const message =
      `알림 권한이 차단되었습니다.\n\n브라우저 설정에서 알림을 허용해주세요:\n\n` +
      `• Chrome: 주소창 왼쪽 🔒 아이콘 → 알림 허용\n` +
      `• Firefox: 주소창 왼쪽 🛡️ 아이콘 → 알림 허용\n` +
      `• Safari: Safari → 환경설정 → 웹사이트 → 알림\n\n` +
      `설정 후 페이지를 새로고침해주세요.`

    alert(message)
    return false
  } else if (permission === 'default') {
    return true // requestPermission()을 호출할 수 있음
  } else {
    return true // 이미 granted
  }
}
