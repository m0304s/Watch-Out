import { css } from '@emotion/react'
import { useState } from 'react'

import type { LoginFormData } from '@/features/auth/types'
import { AppHeader } from '@/features/auth/web/components/AppHeader'
import { LoginForm } from '@/features/auth/web/components/LoginForm'

export const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  
  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true)
    
    try {
      // TODO: 실제 API 호출 구현
      // eslint-disable-next-line no-console
      console.log('Login attempt:', formData)
      
      // 임시 지연 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // 성공 시 리다이렉트 로직 추가 예정
      // eslint-disable-next-line no-console
      console.log('Login successful')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login failed:', error)
      // 에러 처리 로직 추가 예정
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
