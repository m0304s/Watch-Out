import { useState, useEffect, useCallback } from 'react'
import {
  getFCMToken,
  showNotificationPermissionGuide,
} from '@/features/notification/services/firebase'
import { getFCMTokenMobile } from '@/features/notification/services/firebase-mobile'
import { fcmApi } from '@/features/notification/services/fcmApi'
import {
  initializeFCMListeners,
  isFCMListenersInitialized,
} from '@/features/notification/services/fcmManager'
import { subscribeToFCMMessages } from '@/features/notification/services/fcmEventManager'
import { isMobilePlatform } from '@/utils/platform'
import type {
  NotificationMessage,
  FCMPayload,
  NoticeMessage,
} from '@/features/notification/types'
import { generateNotificationId } from '@/features/notification/types'
import { logFCMessage, logFCMToken, logFCMError } from '@/utils/fcmLogger'
import { fcmDebugger } from '@/utils/fcmDebugger'

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationMessage[]>([])
  const [notices, setNotices] = useState<NoticeMessage[]>([])

  // 알림 상태 변화 감지 (디버깅)
  useEffect(() => {
    console.log('🔥🔥🔥 useFCM - notifications 상태 변경됨! 🔥🔥🔥')
    console.log('🔥🔥🔥 현재 알림 개수:', notifications.length)
    console.log('🔥🔥🔥 현재 알림 목록:', notifications)
    console.log('🔥🔥🔥 이 로그가 나타나면 상태 변화가 감지된 것입니다! 🔥🔥🔥')
  }, [notifications])

  // 모달 상태 추가
  const [modalNotification, setModalNotification] =
    useState<NotificationMessage | null>(null)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  // 초기 로드 시 저장된 토큰 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fcm-token')
      if (saved) {
        setToken(saved)
        setIsRegistered(true)
      }
    } catch (e) {
      console.error('Failed to load FCM token from localStorage:', e)
    }
  }, [])

  // FCM 토큰 등록
  const registerToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let fcmToken: string | null = null

      console.log('플랫폼 체크:', {
        isMobile: isMobilePlatform(),
        isWeb: !isMobilePlatform(),
        userAgent: navigator.userAgent,
      })

      if (isMobilePlatform()) {
        console.log('모바일 플랫폼에서 FCM 토큰 발급 시도...')
        fcmToken = await getFCMTokenMobile()
      } else {
        console.log('웹 플랫폼에서 FCM 토큰 발급 시도...')
        fcmToken = await getFCMToken()
      }

      if (!fcmToken) {
        throw new Error(
          'FCM 토큰을 받을 수 없습니다. 알림 권한을 허용해주세요.',
        )
      }

      // 백엔드에 토큰 등록
      await fcmApi.registerToken(fcmToken)

      setToken(fcmToken)
      setIsRegistered(true)
      localStorage.setItem('fcm-token', fcmToken)

      logFCMToken(fcmToken, 'registered')

      // FCM 수신 테스트
      console.log('🧪 FCM 수신 테스트 시작...')
      await fcmDebugger.testFCMReception()
    } catch (err) {
      if (err instanceof Error) {
        logFCMError(err, 'FCM 토큰 등록')
      }
      const errorMessage =
        err instanceof Error ? err.message : 'FCM 토큰 등록 실패'
      setError(errorMessage)

      if (err instanceof Error && err.message.includes('알림 권한')) {
        showNotificationPermissionGuide()
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // FCM 토큰 제거
  const removeToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (token) {
        await fcmApi.removeToken(token)
        setToken(null)
        setIsRegistered(false)
        localStorage.removeItem('fcm-token')
        logFCMToken(token, 'removed')
      }
    } catch (err) {
      if (err instanceof Error) {
        logFCMError(err, 'FCM 토큰 제거')
      }
      const errorMessage =
        err instanceof Error ? err.message : 'FCM 토큰 제거 실패'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // FCM 메시지 처리 함수 - useCallback으로 최적화하여 불필요한 재초기화 방지
  const handleMessage = useCallback((payload: FCMPayload) => {
    try {
      // 통합된 FCM 로깅 시스템 사용
      logFCMessage(payload, 'foreground')

      if (!payload) {
        return
      }

      // FCM 메시지 타입 확인 (data.type 또는 notification.title로 판단)
      const messageType =
        payload.data?.type ||
        (payload.notification?.title?.includes('공지')
          ? 'ANNOUNCEMENT'
          : 'notification')

      if (messageType === 'ANNOUNCEMENT') {
        const notice: NoticeMessage = {
          id: payload.data?.id || Date.now().toString(),
          title:
            payload.data?.title ||
            payload.title ||
            payload.notification?.title ||
            '공지사항',
          content:
            payload.data?.body ||
            payload.body ||
            payload.notification?.body ||
            '',
          timestamp: new Date().toLocaleString('ko-KR'),
          sender: payload.data?.sender || '관리자',
        }

        console.log('📢 공지사항 처리:', notice.title, '-', notice.content)

        // 1. notices 상태에 추가 (웹용)
        setNotices((prev) => {
          const isDuplicate = prev.some(
            (existing) =>
              existing.title === notice.title &&
              existing.content === notice.content &&
              existing.timestamp === notice.timestamp,
          )

          if (isDuplicate) {
            console.log('🚫 중복 공지사항 감지, 추가하지 않음')
            return prev
          }

          console.log('✅ 새 공지사항 추가됨!')
          return [notice, ...prev]
        })

        // 2. notifications 상태에도 추가 (모바일용)
        const notification: NotificationMessage = {
          id: generateNotificationId(),
          title: notice.title,
          body: notice.content,
          imageUrl:
            payload.data?.image || payload.image || payload.notification?.image,
          timestamp: new Date().toISOString(),
          data: {
            type: 'ANNOUNCEMENT',
            sender: notice.sender,
            content: notice.content,
            areaUuid: payload.data?.areaUuid,
          },
        }

        console.log('📢 공지사항을 알림 목록에도 추가 (모바일용):', notification.title)

        setNotifications((prev) => {
          console.log('📝 공지사항 알림 - 기존 알림 개수:', prev.length)
          const isDuplicate = prev.some((existing) => {
            if (notification.id && existing.id) {
              return existing.id === notification.id
            }
            return (
              existing.title === notification.title &&
              existing.body === notification.body &&
              Math.abs(
                new Date(existing.timestamp).getTime() -
                  new Date(notification.timestamp).getTime(),
              ) < 5000
            ) // 5초 이내
          })

          if (isDuplicate) {
            console.log('🚫 중복 공지사항 알림 감지, 추가하지 않음')
            return prev
          }

          console.log('✅ 새 공지사항 알림 추가됨!')
          const newList = [notification, ...prev]
          console.log('📝 업데이트된 알림 목록 개수:', newList.length)
          return newList
        })
      } else {
        // 알림 처리 (안전장비 미착용, 중장비 진입 감지, 안면인식 등)
        const notification: NotificationMessage = {
          id: generateNotificationId(),
          title:
            payload.data?.title ||
            payload.title ||
            payload.notification?.title ||
            '알림',
          body:
            payload.data?.body ||
            payload.body ||
            payload.notification?.body ||
            '',
          imageUrl:
            payload.data?.image || payload.image || payload.notification?.image,
          timestamp: payload.data?.timestamp || new Date().toISOString(),
          data: {
            areaName: payload.data?.areaName,
            cctvName: payload.data?.cctvName,
            violationTypes: payload.data?.violationTypes,
            heavyEquipmentTypes: payload.data?.heavyEquipmentTypes,
            type: payload.data?.type,
            violationUuid: payload.data?.violationUuid,
            imageUrl: payload.data?.imageUrl,
            // 사고 신고 관련 데이터
            accidentType: payload.data?.accidentType,
            reporterName: payload.data?.reporterName,
            companyName: payload.data?.companyName,
            accidentUuid: payload.data?.accidentUuid,
            // 안면인식 관련 데이터
            userName: payload.data?.userName,
            entryType: payload.data?.entryType,
            timestamp: payload.data?.timestamp,
          },
        }

        console.log('🔔 알림 처리:', notification.title, '-', notification.body)

        // 포그라운드 알림 표시 (웹에서만)
        if (!isMobilePlatform()) {
          // 웹에서 브라우저 알림 표시
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              try {
                new Notification(notification.title, {
                  body: notification.body,
                  icon: '/icons/icon-192x192.png',
                  tag: notification.id || 'fcm-notification',
                })
                console.log('✅ 브라우저 알림 생성 성공')
              } catch (error) {
                console.error('❌ 브라우저 알림 생성 실패:', error)
              }
            }
          }
        } else {
          // 모바일에서는 목록에만 추가하고 자동 모달 표시 안함
          console.log('📱 모바일 - 알림을 목록에만 추가합니다')
        }

        console.log('📝 알림 목록에 추가:', notification.title)

        setNotifications((prev) => {
          console.log('📝 일반 알림 - setNotifications 콜백 실행!')
          console.log('📝 기존 알림 개수:', prev.length)

          // 중복 제거 - ID가 있으면 ID로, 없으면 제목+내용+시간으로 비교
          const isDuplicate = prev.some((existing) => {
            if (notification.id && existing.id) {
              return existing.id === notification.id
            }
            return (
              existing.title === notification.title &&
              existing.body === notification.body &&
              existing.timestamp === notification.timestamp
            )
          })

          if (isDuplicate) {
            console.log('🚫 중복 알림 감지, 추가하지 않음')
            return prev
          }

          console.log('✅ 새 알림 추가됨!')
          const newList = [notification, ...prev]
          console.log('📝 업데이트된 알림 목록 개수:', newList.length)
          console.log('🔥🔥🔥 일반 알림 상태 업데이트 완료! 🔥🔥🔥')
          console.log('🔥🔥🔥 이제 UI가 업데이트되어야 합니다! 🔥🔥🔥')
          return newList
        })
      }

      console.log('✅ handleMessage 완료!')
    } catch (error) {
      if (error instanceof Error) {
        logFCMError(error, 'FCM 메시지 처리')
      }
    }
  }, []) // 의존성 배열을 비워서 함수가 안정적으로 유지되도록 함

  // 알림 초기화
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // 특정 알림 제거
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  // 공지사항 초기화
  const clearNotices = useCallback(() => {
    setNotices([])
  }, [])

  // 특정 공지사항 제거
  const removeNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((notice) => notice.id !== id))
  }, [])

  // FCM 메시지 리스너 설정 (전역 매니저 사용)
  useEffect(() => {
    console.log('🚨🚨🚨 useFCM useEffect 실행됨! 🚨🚨🚨')
    console.log('🔧 FCM 훅 마운트 - 리스너 초기화 체크...')
    console.log('🔧 현재 플랫폼:', isMobilePlatform() ? '모바일' : '웹')
    console.log(
      '🔧 FCM 리스너 초기화 상태:',
      isFCMListenersInitialized() ? '이미 초기화됨' : '초기화 필요',
    )

    // FCM 상태 진단
    fcmDebugger.diagnoseFCMStatus().then((debugInfo) => {
      fcmDebugger.provideSolution(debugInfo)
    })

    // 전역 FCM 리스너 초기화 (한 번만)
    if (!isFCMListenersInitialized()) {
      console.log('🚨🚨🚨 전역 FCM 리스너 초기화 시작! 🚨🚨🚨')
      initializeFCMListeners()
      console.log('🚨🚨🚨 전역 FCM 리스너 초기화 완료! 🚨🚨🚨')
    } else {
      console.log('⚠️ FCM 리스너가 이미 초기화되어 있습니다.')
    }

    // 이 컴포넌트의 handleMessage를 전역 이벤트 시스템에 구독
    console.log('🎧 FCM 이벤트 구독 시작...')
    const unsubscribe = subscribeToFCMMessages(handleMessage)
    console.log('🎧 FCM 이벤트 구독 완료!')

    // 컴포넌트 언마운트 시 이벤트 구독 해제
    return () => {
      console.log('🧹 FCM 훅 언마운트 - 이벤트 구독 해제')
      unsubscribe()
    }
  }, [handleMessage]) // handleMessage가 변경되면 재구독

  // FCM 강제 테스트 함수
  const forceTestFCM = useCallback(async () => {
    console.log('🚀 FCM 강제 테스트 시작...')
    await fcmDebugger.forceTestFCMReception()
  }, [])

  // FCM 상태 진단 함수
  const diagnoseFCM = useCallback(async () => {
    console.log('🔍 FCM 상태 진단 시작...')
    const debugInfo = await fcmDebugger.diagnoseFCMStatus()
    fcmDebugger.provideSolution(debugInfo)
    return debugInfo
  }, [])

  // Service Worker 강제 등록 함수
  const forceRegisterServiceWorker = useCallback(async () => {
    console.log('🔧 Service Worker 강제 등록 시작...')
    return await fcmDebugger.forceRegisterServiceWorker()
  }, [])

  // 전역 디버깅 함수 등록
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).fcmDebug = {
        diagnose: diagnoseFCM,
        test: forceTestFCM,
        status: () => fcmDebugger.diagnoseFCMStatus(),
        registerSW: forceRegisterServiceWorker,
      }
      console.log('🔧 전역 FCM 디버깅 함수 등록됨: window.fcmDebug')
    }
  }, [diagnoseFCM, forceTestFCM, forceRegisterServiceWorker])

  // 모달 제어 함수들
  const closeModal = useCallback(() => {
    setIsModalVisible(false)
    setModalNotification(null)
  }, [])

  const showModal = useCallback((notification: NotificationMessage) => {
    setModalNotification(notification)
    setIsModalVisible(true)
  }, [])

  return {
    token,
    isRegistered,
    isLoading,
    error,
    notifications,
    notices,
    registerToken,
    removeToken,
    clearNotifications,
    removeNotification,
    clearNotices,
    removeNotice,
    // 모달 관련
    modalNotification,
    isModalVisible,
    closeModal,
    showModal,
    // 디버깅 함수들
    forceTestFCM,
    diagnoseFCM,
    forceRegisterServiceWorker,
  }
}
