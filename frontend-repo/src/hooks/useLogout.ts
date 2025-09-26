import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { logout as logoutApi } from '@/features/auth/api/auth'

/**
 * 로그아웃 기능을 제공하는 커스텀 훅
 * 웹과 모바일에서 공통으로 사용할 수 있습니다.
 */
export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      // API 로그아웃 호출 (localStorage의 모든 데이터도 삭제됨)
      await logoutApi()
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error)
      // API 호출이 실패해도 로컬 상태는 정리
    } finally {
      // Zustand store 상태 초기화 (localStorage는 이미 logoutApi에서 제거됨)
      logout()
      setIsLoggingOut(false)

      // 로그인 페이지로 리다이렉트
      window.location.href = '/login'
    }
  }

  return {
    handleLogout,
    isLoggingOut,
  }
}
