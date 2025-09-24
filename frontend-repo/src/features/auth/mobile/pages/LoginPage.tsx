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
import { getFCMTokenMobile } from '@/features/notification/services/firebase-mobile'
import { fcmApi } from '@/features/notification/services/fcmApi'

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
      console.log('📱 로그인 시도 시작 - FCM 토큰 발급을 먼저 시도합니다...')

      // 1. 먼저 FCM 토큰 발급 시도
      let fcmToken: string | null = null
      try {
        fcmToken = await getFCMTokenMobile()
        if (fcmToken) {
          console.log(
            '✅ FCM 토큰 발급 성공:',
            fcmToken.substring(0, 20) + '...',
          )
        } else {
          console.log('⚠️ FCM 토큰 발급 실패 - 로그인은 계속 진행합니다.')
        }
      } catch (fcmError) {
        console.error('❌ FCM 토큰 발급 중 오류:', fcmError)
        console.log('⚠️ FCM 토큰 발급 실패 - 로그인은 계속 진행합니다.')
      }

      // 2. 로그인 API 호출
      const loginRequest: LoginRequest = {
        userId: formData.id,
        password: formData.password,
      }

      const response = await login(loginRequest)

      if (response.success && response.result) {
        // Auth 스토어에 로그인 정보 저장
        setAuthData(response.result)

        console.log('✅ 모바일 로그인 성공:', response.result)

        // 3. 로그인 성공 후 FCM 토큰을 서버에 등록
        if (fcmToken) {
          try {
            await fcmApi.registerToken(fcmToken)
            console.log('✅ FCM 토큰 서버 등록 성공!')
          } catch (fcmRegisterError) {
            console.error('❌ FCM 토큰 서버 등록 실패:', fcmRegisterError)
            // FCM 등록 실패는 로그인 성공을 방해하지 않음
          }
        }

        // 네이티브 플랫폼에서 토큰 저장
        if (Capacitor.isNativePlatform()) {
          try {
            await Token.saveToken({ token: response.result.accessToken })
            console.log('Token saved successfully to native storage.')
          } catch (error) {
            console.error('Failed to save token to native storage:', error)
          }
        }

        alert('로그인 성공!')

        console.log('🔐 로그인 성공 - 사용자 역할:', response.result.userRole)
        console.log('🔐 인증 상태:', response.result)

        // 사용자 역할에 따른 라우팅
        if (response.result.userRole === 'WORKER') {
          // 작업자인 경우 알림 페이지로 이동
          console.log('👷 작업자 로그인 - 알림 페이지로 이동')
          navigate('/notification')
        } else {
          // 관리자나 구역 관리자인 경우 작업자 목록으로 이동
          console.log('👨‍💼 관리자 로그인 - 작업자 목록으로 이동')
          navigate('/worker2')
        }
      } else {
        const errorMessage = response.message || '로그인에 실패했습니다.'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('모바일 로그인 실패 - 상세 에러:', error)
      console.error('에러 타입:', typeof error)
      console.error(
        '에러 메시지:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      console.error(
        '에러 스택:',
        error instanceof Error ? error.stack : 'No stack trace',
      )

      let errorMessage = '로그인 중 오류가 발생했습니다.'

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // API 에러 응답인 경우
        if ('response' in error) {
          const apiError = error as any
          console.error('API 에러 응답:', apiError.response?.data)
          errorMessage =
            apiError.response?.data?.message || apiError.message || errorMessage
        } else if ('message' in error) {
          errorMessage = (error as any).message
        }
      }

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
