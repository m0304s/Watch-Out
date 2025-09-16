import { useState, useEffect, useCallback } from 'react'
import { getFCMToken, onFCMMessage } from '../services/firebase'
import { getFCMTokenMobile, setupFCMListeners } from '../services/firebase-mobile'
import { fcmApi } from '../services/fcmApi'
import { isMobilePlatform } from '@/utils/platform'
import type { NotificationMessage } from '../types'

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationMessage[]>([])

  // FCM 토큰 등록
  const registerToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. 플랫폼별 FCM 토큰 발급
      let fcmToken: string | null = null
      
      if (isMobilePlatform()) {
        // 모바일 (Android)
        fcmToken = await getFCMTokenMobile()
      } else {
        // 웹
        fcmToken = await getFCMToken()
      }

      if (!fcmToken) {
        throw new Error('FCM 토큰 발급에 실패했습니다. Firebase 설정을 확인해주세요.')
      }

      // 2. 백엔드에 토큰 등록
      await fcmApi.registerToken(fcmToken)
      
      setToken(fcmToken)
      setIsRegistered(true)
      console.log('FCM 토큰 등록 성공:', fcmToken)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'FCM 토큰 등록 실패'
      setError(errorMessage)
      console.error('FCM 토큰 등록 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // FCM 토큰 삭제
  const removeToken = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      await fcmApi.removeToken(token)
      setToken(null)
      setIsRegistered(false)
      console.log('FCM 토큰 삭제 성공')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'FCM 토큰 삭제 실패'
      setError(errorMessage)
      console.error('FCM 토큰 삭제 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // FCM 메시지 수신 설정
  useEffect(() => {
    const handleMessage = (payload: any) => {
      console.log('FCM 메시지 수신:', payload)
      
      const notification: NotificationMessage = {
        title: payload.title || payload.notification?.title || '알림',
        body: payload.body || payload.notification?.body || '',
        imageUrl: payload.image || payload.notification?.image,
        data: payload.data || payload.additionalData
      }

      setNotifications(prev => [notification, ...prev])
    }

    if (isMobilePlatform()) {
      // 모바일 (Android)
      setupFCMListeners(handleMessage)
    } else {
      // 웹
      const unsubscribe = onFCMMessage(handleMessage)
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    }
  }, [])

  return {
    token,
    isRegistered,
    isLoading,
    error,
    notifications,
    registerToken,
    removeToken,
    clearNotifications: () => setNotifications([])
  }
}
