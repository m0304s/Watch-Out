import { FCMProvider, useFCMContext } from '@/features/notification/contexts/FCMContext'
import { NotificationModal } from '@/features/notification/components/NotificationModal'

interface MobileFCMProviderProps {
  children: React.ReactNode
}

/**
 * 모바일 환경에서 FCM Provider의 내부 컴포넌트
 * FCM Context에서 모달 상태를 가져와서 알림 모달을 표시합니다.
 */
const MobileFCMInner = ({ children }: MobileFCMProviderProps) => {
  console.log('📱 모바일 FCM Inner 컴포넌트 렌더링...')
  
  // FCM Context에서 모달 상태 가져오기
  const { modalNotification, isModalVisible, closeModal } = useFCMContext()
  
  return (
    <>
      {children}
      {/* 알림 모달 */}
      <NotificationModal
        notification={modalNotification}
        isVisible={isModalVisible}
        onClose={closeModal}
      />
    </>
  )
}

/**
 * 모바일 환경에서 FCM Provider 컴포넌트
 * FCM Context Provider로 감싸서 전역 상태를 제공합니다.
 */
export const MobileFCMProvider = ({ children }: MobileFCMProviderProps) => {
  console.log('📱 모바일 FCM Provider 초기화... (FCM Context 제공)')
  
  return (
    <FCMProvider>
      <MobileFCMInner>
        {children}
      </MobileFCMInner>
    </FCMProvider>
  )
}