import { isMobilePlatform } from '@/utils/platform'
import RouterMobile from '@/routes/RouterMobile'
import RouterWeb from '@/routes/RouterWeb'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { refreshToken } from '@/features/auth/api/auth'

const App = () => {
  const isMobile = isMobilePlatform()
  const { isAuthenticated, updateToken, clearAuth } = useAuthStore()

  // 새로고침 등으로 메모리 초기화된 경우를 대비해 최초 1회 토큰 재발급 시도
  useEffect(() => {
    const tryReissue = async () => {
      try {
        const res = await refreshToken()
        if (res?.success && res.result?.accessToken) {
          updateToken(res.result.accessToken)
        }
      } catch {
        // 재발급 실패 시 인증 해제
        if (isAuthenticated) {
          clearAuth()
        }
      }
    }

    // 앱 마운트 시 한 번만 호출
    tryReissue()
  }, [])

  return <div>{isMobile ? <RouterMobile /> : <RouterWeb />}</div>
}
export default App
