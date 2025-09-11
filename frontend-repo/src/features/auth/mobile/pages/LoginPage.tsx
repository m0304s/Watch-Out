import { css } from '@emotion/react'
import { useState } from 'react'

import type { LoginFormData } from '@/features/auth/types'
import { MobileAppHeader } from '@/features/auth/mobile/components/AppHeader'
import { MobileLoginForm } from '@/features/auth/mobile/components/LoginForm'

export const MobileLoginPage = () => {
  const [loading, setLoading] = useState(false)

  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true)
    try {
      // 실제 API 연결 전까지 임시 동작
      // eslint-disable-next-line no-console
      console.log('Mobile Login attempt:', formData)
      await new Promise((resolve) => setTimeout(resolve, 800))
      // eslint-disable-next-line no-console
      console.log('Mobile Login successful')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Mobile Login failed:', error)
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


