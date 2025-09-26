import { css } from '@emotion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { LoginFormData, LoginRequest } from '@/features/auth/types'
import { AppHeader } from '@/features/auth/web/components/AppHeader'
import { LoginForm } from '@/features/auth/web/components/LoginForm'
import { login } from '@/features/auth/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useFCM } from '@/features/notification/hooks/useFCM'
import { useToast } from '@/hooks/useToast'
import { isWebPlatform } from '@/utils/platform'

export const LoginPage = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuthData, setError } = useAuthStore()
  const { registerToken } = useFCM()

  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true)

    try {
      const loginRequest: LoginRequest = {
        userId: formData.id,
        password: formData.password,
      }

      const response = await login(loginRequest)

      if (response.success && response.result) {
        // 웹 환경에서 WORKER 역할 사용자 로그인 차단
        if (isWebPlatform() && response.result.userRole === 'WORKER') {
          toast.warning('모바일로 로그인 해주세요.')
          setLoading(false)
          return
        }

        // Auth 스토어에 로그인 정보 저장
        setAuthData(response.result)

        // FCM 토큰 등록 시도
        try {
          console.log('로그인 성공: FCM 토큰 등록 시도...')
          await registerToken()
        } catch (fcmError) {
          console.error('FCM 토큰 등록 실패:', fcmError)
          // FCM 토큰 등록 실패해도 로그인은 계속 진행
        }
        // 대시보드로 리다이렉트 (루트 경로로 이동하면 자동으로 /dashboard로 리다이렉트됨)
        navigate('/')
      } else {
        const errorMessage = response.message || '로그인에 실패했습니다'
        setError(errorMessage)
      }
    } catch (error) {
      toast.error('로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div css={pageContainer}>
      <div css={contentContainer}>
        <AppHeader />
        <LoginForm onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  )
}

const pageContainer = css`
  min-height: 100vh;
  background-color: var(--color-gray-50);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`

const contentContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
`
