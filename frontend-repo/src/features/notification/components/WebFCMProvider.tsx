import { useEffect } from 'react'
import { useFCM } from '@/features/notification/hooks/useFCM'

interface WebFCMProviderProps {
  children: React.ReactNode
}

/**
 * 웹 환경에서 FCM 초기화를 담당하는 Provider 컴포넌트
 */
export const WebFCMProvider = ({ children }: WebFCMProviderProps) => {
  const { registerToken, notifications, notices } = useFCM()

  useEffect(() => {
    console.log('🌐 웹 FCM Provider 초기화...')
    
    // 웹에서는 사용자가 직접 알림 허용을 클릭했을 때만 토큰 등록
    // 자동으로 등록하지 않음
    console.log('🌐 웹에서는 사용자 액션에 의해 FCM 토큰이 등록됩니다.')
  }, [])

  // 알림 상태 변경 감지 (디버깅용)
  useEffect(() => {
    console.log('🌐 웹 FCM - 알림 목록 업데이트:', notifications.length)
  }, [notifications])

  useEffect(() => {
    console.log('🌐 웹 FCM - 공지사항 목록 업데이트:', notices.length)
  }, [notices])

  return <>{children}</>
}
