import React, { createContext, useContext, type ReactNode } from 'react'
import { useFCM } from '@/features/notification/hooks/useFCM'
import type { NotificationMessage, NoticeMessage } from '@/features/notification/types'

// FCM Context 타입 정의
interface FCMContextType {
  // 토큰 관리
  token: string | null
  isRegistered: boolean
  isLoading: boolean
  error: string | null
  registerToken: () => Promise<void>
  removeToken: () => Promise<void>

  // 알림 관리
  notifications: NotificationMessage[]
  notices: NoticeMessage[]
  clearNotifications: () => void
  removeNotification: (id: string) => void

  // 모달 관리
  modalNotification: NotificationMessage | null
  isModalVisible: boolean
  showModal: (notification: NotificationMessage) => void
  closeModal: () => void
}

// FCM Context 생성
const FCMContext = createContext<FCMContextType | null>(null)

// FCM Provider Props
interface FCMProviderProps {
  children: ReactNode
}

// FCM Provider 컴포넌트
export const FCMProvider: React.FC<FCMProviderProps> = ({ children }) => {
  console.log('🌍 FCM Context Provider 초기화...')
  
  const fcmHook = useFCM()
  
  return (
    <FCMContext.Provider value={fcmHook}>
      {children}
    </FCMContext.Provider>
  )
}

// FCM Context 사용 훅
export const useFCMContext = (): FCMContextType => {
  const context = useContext(FCMContext)
  
  if (!context) {
    throw new Error('useFCMContext must be used within a FCMProvider')
  }
  
  return context
}
