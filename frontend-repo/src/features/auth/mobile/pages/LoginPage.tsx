import { css } from '@emotion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { registerPlugin } from '@capacitor/core'
import { useToast } from '@/hooks/useToast'
import type { LoginFormData, LoginRequest } from '@/features/auth/types'
import { MobileAppHeader } from '@/features/auth/mobile/components/AppHeader'
import { MobileLoginForm } from '@/features/auth/mobile/components/LoginForm'
import { login } from '@/features/auth/api/auth'
import { useAuthStore } from '@/stores/authStore'

interface TokenPlugin {
  saveToken(options: { token: string }): Promise<void>
}

const Token = registerPlugin<TokenPlugin>('Token')

export const MobileLoginPage = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuthData, setError } = useAuthStore()

  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true)

    try {
      const loginRequest: LoginRequest = {
        userId: formData.id,
        password: formData.password,
      }

      const response = await login(loginRequest)

      if (response.success && response.result) {
        // Auth 스토어에 로그인 정보 저장
        setAuthData(response.result)

        if (Capacitor.isNativePlatform()) {
          try {
            await Token.saveToken({ token: response.result.accessToken })
            console.log('Token saved successfully to native storage.')
          } catch (error) {
            console.error('Failed to save token to native storage:', error)
          }
        }

        // 대시보드로 리다이렉트
        navigate('/worker2')
      } else {
        const errorMessage = response.message || '로그인에 실패했습니다.'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      const errorMessage = '로그인 중 오류가 발생했습니다.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div css={pageContainer}>
      <div css={contentContainer}>
        <MobileAppHeader />
        <MobileLoginForm onSubmit={handleLogin} loading={loading} />
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
  padding: 32px 16px;
`

const contentContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
`
