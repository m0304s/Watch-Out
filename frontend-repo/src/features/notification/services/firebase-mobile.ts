import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

// Android FCM 토큰 발급
export const getFCMTokenMobile = async (): Promise<string | null> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('웹 환경에서는 웹 FCM을 사용하세요')
      return null
    }

    // 푸시 알림 권한 요청
    const permStatus = await PushNotifications.requestPermissions()
    
    if (permStatus.receive !== 'granted') {
      throw new Error('푸시 알림 권한이 거부되었습니다')
    }

    // 푸시 알림 등록
    await PushNotifications.register()

    // 토큰을 Promise로 반환
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('FCM 토큰 발급 시간 초과'))
      }, 10000)

      PushNotifications.addListener('registration', (token) => {
        clearTimeout(timeout)
        console.log('FCM 토큰 발급 성공:', token.value)
        resolve(token.value)
      })

      PushNotifications.addListener('registrationError', (error) => {
        clearTimeout(timeout)
        console.error('FCM 토큰 발급 실패:', error)
        reject(new Error('FCM 토큰 발급 실패'))
      })
    })

  } catch (error) {
    console.error('FCM 토큰 발급 실패:', error)
    return null
  }
}

// Android FCM 메시지 수신 설정
export const setupFCMListeners = (onMessage: (payload: any) => void) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('웹 환경에서는 웹 FCM을 사용하세요')
    return
  }

  // 포그라운드 메시지 수신
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('포그라운드 메시지 수신:', notification)
    onMessage(notification)
  })

  // 백그라운드 메시지 수신 (앱이 종료된 상태에서 알림 클릭)
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('백그라운드 메시지 클릭:', notification)
    onMessage(notification.notification)
  })
}
