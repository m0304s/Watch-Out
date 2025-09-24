import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import type { FCMPayload } from '@/features/notification/types'
import {
  logFCMessage,
  logFCMToken,
  logFCMError,
  logFCMPermission,
  logFCMInit,
  logFCMListener,
} from '@/utils/fcmLogger'

/**
 * 모바일 FCM 초기화 및 리스너 등록을 한 번에 처리하는 통합 함수
 */
export const initMobileFCM = (
  onMessage: (payload: FCMPayload) => void,
): Promise<string | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('⚠️ 모바일 플랫폼이 아닙니다.')
        return resolve(null)
      }

      logFCMInit('mobile', true, '모바일 FCM 초기화 시작')

      // 1. 권한 확인 및 요청
      let permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === 'prompt') {
        logFCMPermission(permStatus.receive, 'requested')
        permStatus = await PushNotifications.requestPermissions()
      }

      if (permStatus.receive !== 'granted') {
        logFCMPermission(permStatus.receive, 'denied')
        throw new Error('푸시 알림 권한이 거부되었습니다.')
      }
      logFCMPermission(permStatus.receive, 'granted')

      // 2. 모든 리스너 등록
      logFCMListener('모바일 포그라운드 메시지', true)

      // 알림 수신 리스너 (포그라운드)
      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          logFCMessage(notification, 'foreground')
          onMessage(notification)
        },
      )

      // 알림 클릭 리스너 (백그라운드/종료 상태)
      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification) => {
          logFCMessage(notification.notification, 'click')
          onMessage(notification.notification)
        },
      )

      // 토큰 등록 에러 리스너
      await PushNotifications.addListener('registrationError', (error) => {
        logFCMError(new Error(error.toString()), 'FCM 토큰 등록')
        reject(new Error('FCM 토큰 등록 중 에러 발생'))
      })

      // 토큰 등록 성공 리스너 (가장 중요)
      await PushNotifications.addListener('registration', (token) => {
        logFCMToken(token.value, 'registered')
        resolve(token.value) // Promise를 통해 토큰 값 반환
      })

      // 3. 모든 리스너가 준비된 후 FCM 등록 시작
      await PushNotifications.register()
    } catch (error) {
      if (error instanceof Error) {
        logFCMError(error, '모바일 FCM 초기화')
      }
      reject(error)
    }
  })
}

// 기존 함수들은 유지하되, 직접 사용하지 않도록 주석 처리하거나 삭제할 수 있습니다.
// 여기서는 설명을 위해 그대로 둡니다.

// Android FCM 토큰 발급
export const getFCMTokenMobile = async (): Promise<string | null> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('⚠️ 모바일 플랫폼이 아닙니다.')
      return null
    }

    console.log('🔐 푸시 알림 권한 요청...')
    // 푸시 알림 권한 요청
    const permStatus = await PushNotifications.requestPermissions()

    if (permStatus.receive !== 'granted') {
      throw new Error('푸시 알림 권한이 거부되었습니다')
    }

    console.log('✅ 푸시 알림 권한 허용됨')

    // 먼저 리스너를 설정한 후 등록
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error('⏰ FCM 토큰 발급 시간 초과 (10초)')
        reject(new Error('FCM 토큰 발급 시간 초과'))
      }, 10000)

      console.log('👂 FCM 등록 이벤트 리스너 설정...')

      // registration 이벤트 리스너 먼저 설정
      PushNotifications.addListener('registration', (token) => {
        console.log('🎫 FCM 등록 이벤트 수신:', token)
        clearTimeout(timeout)
        if (token && token.value) {
          console.log(
            '✅ FCM 토큰 발급 성공:',
            token.value.substring(0, 20) + '...',
          )
          resolve(token.value)
        } else {
          console.error('❌ FCM 토큰 값이 없습니다:', token)
          reject(new Error('FCM 토큰 값이 없습니다'))
        }
      })

      // registrationError 이벤트 리스너 설정
      PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ FCM 등록 에러:', error)
        clearTimeout(timeout)
        reject(
          new Error(
            'FCM 토큰 발급 실패: ' + (error.message || '알 수 없는 오류'),
          ),
        )
      })

      // 리스너 설정 후 푸시 알림 등록
      console.log('📱 푸시 알림 등록 시작...')
      PushNotifications.register().catch((error) => {
        console.error('❌ 푸시 알림 등록 실패:', error)
        clearTimeout(timeout)
        reject(new Error('푸시 알림 등록 실패: ' + error.message))
      })
    })
  } catch (error) {
    console.error('❌ FCM 토큰 발급 중 오류:', error)
    return null
  }
}

// Android FCM 메시지 수신 설정
export const setupFCMListeners = (
  onMessage: (payload: FCMPayload) => void,
): (() => void) | undefined => {
  if (!Capacitor.isNativePlatform()) {
    console.log('⚠️ 모바일 플랫폼이 아닙니다. FCM 리스너를 설정하지 않습니다.')
    return undefined
  }

  console.log('🚨🚨🚨 모바일 FCM 리스너 설정 시작! 🚨🚨🚨')
  console.log('🔧 Capacitor 네이티브 플랫폼:', Capacitor.isNativePlatform())
  console.log(
    '🔧 PushNotifications 플러그인 사용 가능:',
    Capacitor.isPluginAvailable('PushNotifications'),
  )
  console.log('🔧 현재 플랫폼:', Capacitor.getPlatform())
  console.log(
    '🔧 Capacitor 정보:',
    JSON.stringify({
      isNativePlatform: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      pushNotificationsAvailable:
        Capacitor.isPluginAvailable('PushNotifications'),
    }),
  )
  console.log('🚨🚨🚨 리스너 설정 전 상태 확인 완료! 🚨🚨🚨')

  // 리스너 설정 전 테스트 로그
  console.log(
    '🧪 포그라운드 리스너 설정 전 테스트 로그 - 이 로그가 보이면 함수가 실행됨',
  )

  // 포그라운드 메시지 수신
  const foregroundListener = PushNotifications.addListener(
    'pushNotificationReceived',
    (notification) => {
      console.log('🚨🚨🚨 포그라운드 FCM 메시지 수신! 🚨🚨🚨')
      console.log('🚨🚨🚨 리스너가 실제로 호출됨! 🚨🚨🚨')
      console.log('📱 포그라운드 FCM 메시지 수신:', notification)
      console.log('📱 포그라운드 메시지 데이터:', notification.data)
      console.log('📱 포그라운드 메시지 제목:', notification.title)
      console.log('📱 포그라운드 메시지 내용:', notification.body)
      console.log(
        '📱 포그라운드 메시지 전체 객체:',
        JSON.stringify(notification, null, 2),
      )
      console.log('🚨🚨🚨 포그라운드 메시지 처리 시작 🚨🚨🚨')

      // 포그라운드 메시지 데이터 구조 변환
      const processedNotification = {
        ...notification,
        // title과 body가 undefined인 경우 data에서 가져오기
        title: notification.title || notification.data?.title,
        body: notification.body || notification.data?.body,
        // data 필드는 그대로 유지
        data: notification.data,
      }

      console.log('📱 처리된 포그라운드 메시지:', processedNotification)
      console.log('📱 처리된 메시지 제목:', processedNotification.title)
      console.log('📱 처리된 메시지 내용:', processedNotification.body)

      try {
        console.log('🚨🚨🚨 포그라운드 onMessage 호출 시작 🚨🚨🚨')
        console.log('📱 onMessage 함수 타입:', typeof onMessage)
        console.log(
          '📱 onMessage 함수 존재 여부:',
          onMessage ? '존재함' : '없음',
        )
        console.log(
          '📱 전달할 메시지 객체:',
          JSON.stringify(processedNotification, null, 2),
        )
        onMessage(processedNotification)
        console.log('🚨🚨🚨 포그라운드 onMessage 호출 성공 🚨🚨🚨')
      } catch (error) {
        console.error('❌ 포그라운드 onMessage 호출 실패:', error)
        console.error('❌ 에러 스택:', error.stack)
      }

      console.log('🚨🚨🚨 포그라운드 메시지 처리 완료 🚨🚨🚨')
    },
  )

  console.log('🧪 포그라운드 리스너 설정 완료 테스트 로그')

  // 백그라운드 메시지 수신 (data-only 메시지용)
  const backgroundListener = PushNotifications.addListener(
    'pushNotificationReceived',
    async (notification) => {
      logFCMessage(notification, 'background')

      // data-only 메시지인 경우 로컬 알림 생성
      if (!notification.title && !notification.body && notification.data) {
        try {
          // 로컬 알림 권한 확인
          const permissions = await LocalNotifications.checkPermissions()
          if (permissions.display !== 'granted') {
            await LocalNotifications.requestPermissions()
          }

          // 로컬 알림 생성
          await LocalNotifications.schedule({
            notifications: [
              {
                title: notification.data.title || '알림',
                body: notification.data.body || '',
                id: Date.now(),
                schedule: { at: new Date(Date.now() + 1000) }, // 1초 후 표시
                sound: 'default',
                attachments: notification.data.image
                  ? [
                      {
                        id: 'image',
                        url: notification.data.image,
                      },
                    ]
                  : undefined,
                extra: notification.data,
              },
            ],
          })
        } catch (error) {
          if (error instanceof Error) {
            logFCMError(error, '백그라운드 로컬 알림 생성')
          }
        }
      }

      // 백그라운드 메시지 데이터 구조 변환
      const processedNotification = {
        ...notification,
        title: notification.title || notification.data?.title,
        body: notification.body || notification.data?.body,
        data: notification.data,
      }

      console.log('📱 처리된 백그라운드 메시지:', processedNotification)

      try {
        console.log('🚨🚨🚨 백그라운드 onMessage 호출 시작 🚨🚨🚨')
        onMessage(processedNotification)
        console.log('🚨🚨🚨 백그라운드 onMessage 호출 성공 🚨🚨🚨')
      } catch (error) {
        console.error('❌ 백그라운드 onMessage 호출 실패:', error)
      }

      console.log('🚨🚨🚨 백그라운드 메시지 처리 완료 🚨🚨🚨')
    },
  )

  // 알림 클릭 리스너 (백그라운드/종료 상태에서 알림 클릭 시)
  const actionListener = PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {
      console.log('🚨🚨🚨 백그라운드 알림 클릭! 🚨🚨🚨')
      console.log('📱 클릭된 알림:', notification.notification)

      const processedNotification = {
        ...notification.notification,
        title:
          notification.notification.title ||
          notification.notification.data?.title,
        body:
          notification.notification.body ||
          notification.notification.data?.body,
        data: notification.notification.data,
      }

      try {
        onMessage(processedNotification)
        console.log('🚨🚨🚨 알림 클릭 처리 완료 🚨🚨🚨')
      } catch (error) {
        console.error('❌ 알림 클릭 처리 실패:', error)
      }
    },
  )

  console.log(
    '📱 포그라운드 리스너 설정:',
    foregroundListener ? '성공' : '실패',
  )
  console.log(
    '📱 백그라운드 리스너 설정:',
    backgroundListener ? '성공' : '실패',
  )

  // 등록 이벤트 리스너 추가
  PushNotifications.addListener('registration', (token) => {
    console.log('🎫 FCM 토큰 등록 이벤트:', token)
  })

  // 등록 에러 이벤트 리스너 추가
  PushNotifications.addListener('registrationError', (error) => {
    console.error('❌ FCM 토큰 등록 에러:', error)
  })

  // 테스트용: 추가 이벤트 리스너
  console.log('🧪 테스트용 중복 리스너 추가...')

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log(
      '🔥🔥🔥 테스트 리스너 - 포그라운드:',
      JSON.stringify(notification, null, 2),
    )
    console.log(
      '🔥🔥🔥 테스트 리스너 - 제목:',
      notification.title || notification.data?.title,
    )
    console.log(
      '🔥🔥🔥 테스트 리스너 - 내용:',
      notification.body || notification.data?.body,
    )
  })

  // 커스텀 FCM 서비스에서 발송하는 CustomEvent 리스너 추가
  console.log('🧪 CustomEvent 리스너 추가...')
  if (typeof window !== 'undefined') {
    window.addEventListener(
      'capacitor:pushNotificationReceived',
      (event: CustomEvent) => {
        console.log('🚨🚨🚨 CustomEvent로 FCM 메시지 수신! 🚨🚨🚨')
        console.log('📱 onMessage 함수 타입:', typeof onMessage)
        console.log('📱 onMessage 함수 존재:', onMessage ? '존재함' : '없음')

        try {
          console.log('📱 CustomEvent 전체:', event)
          console.log('📱 CustomEvent detail:', event.detail)
          console.log('📱 CustomEvent detail 타입:', typeof event.detail)
        } catch (error) {
          console.error('❌ CustomEvent 로깅 실패:', error)
        }

        try {
          // 이벤트 데이터를 FCMPayload 형식으로 변환
          let notification = event.detail

          // detail이 문자열인 경우 JSON 파싱 시도
          if (typeof event.detail === 'string') {
            console.log('📱 문자열 데이터 파싱 시도:', event.detail)
            notification = JSON.parse(event.detail)
          }

          console.log('📱 파싱된 notification:', notification)
          console.log('📱 notification.data:', notification?.data)
          console.log('📱 notification.title:', notification?.title)
          console.log('📱 notification.body:', notification?.body)

          if (notification && (notification.data || notification.title)) {
            console.log('📱 CustomEvent를 통한 메시지 처리 시작...')

            // 안전한 payload 객체 생성
            const safePayload = {
              title: notification.title || '',
              body: notification.body || '',
              data: notification.data || {},
              notification: notification.notification || null,
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
            }

            console.log('📱 안전한 payload 생성 완료:', safePayload)
            console.log('📱 onMessage 함수 호출 시작...')

            try {
              onMessage(safePayload)
              console.log('📱 onMessage 함수 호출 성공!')
            } catch (error) {
              console.error('❌ onMessage 함수 호출 실패:', error)
              console.error('❌ 에러 스택:', error.stack)
            }

            console.log('📱 CustomEvent를 통한 메시지 처리 완료!')
          } else {
            console.log(
              '❌ CustomEvent 데이터가 유효하지 않습니다:',
              notification,
            )
          }
        } catch (error) {
          console.error('❌ CustomEvent 처리 중 오류:', error)
          console.error('❌ 원본 데이터:', event.detail)
        }
      },
    )
    console.log('✅ CustomEvent 리스너 설정 완료')
  }

  console.log('✅ 모바일 FCM 리스너 설정 완료')

  // 정리 함수 반환
  return () => {
    console.log('🧹 모바일 FCM 리스너 정리')
  }
}
