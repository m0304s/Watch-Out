import { css } from '@emotion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { LoginFormData, LoginRequest } from '@/features/auth/types'
import { AppHeader } from '@/features/auth/web/components/AppHeader'
import { LoginForm } from '@/features/auth/web/components/LoginForm'
import { login } from '@/features/auth/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'

export const LoginPage = () => {
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

        toast.success('로그인 성공!')
        console.log('로그인 성공:', response.result)

        // 대시보드로 리다이렉트
        navigate('/dashboard')
      } else {
        const errorMessage = response.message || '로그인에 실패했습니다.'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = '로그인 중 오류가 발생했습니다.'
      console.error('로그인 실패:', error)
      setError(errorMessage)
      toast.error(errorMessage)
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
