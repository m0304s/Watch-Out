import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clearAllAuthData } from '@/utils/logout'
import type { LoginResponse } from '@/features/auth/types'
import { logout as authLogout } from '@/features/auth/api/auth'
import { logger } from '@/utils/logger'

interface AuthState {
  // 인증 상태
  isAuthenticated: boolean
  accessToken: string | null

  // 사용자 정보
  userUuid: string | null
  userId: string | null
  userName: string | null
  userRole: 'WORKER' | 'AREA_ADMIN' | 'ADMIN' | null
  areaUuid: string | null // AREA_ADMIN 사용자만 가지고 있음
  isApproved: boolean

  // 로딩 상태
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  // 로그인 성공 시 상태 업데이트
  setAuthData: (loginResponse: LoginResponse) => void

  // 로그아웃
  logout: () => void

  // 토큰 업데이트
  updateToken: (accessToken: string) => void

  // 에러 상태 관리
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void

  // 초기화
  clearAuth: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  userUuid: null,
  userId: null,
  userName: null,
  userRole: null,
  areaUuid: null,
  isApproved: false,
  isLoading: false,
  error: null,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuthData: (loginResponse: LoginResponse) => {
        logger.storeAction('authStore', 'setAuthData', {
          userUuid: loginResponse.userUuid,
          userId: loginResponse.userId,
          userRole: loginResponse.userRole,
        })

        // localStorage에 토큰 저장 (라우터에서 사용)
        localStorage.setItem('accessToken', loginResponse.accessToken)
        localStorage.setItem('userUuid', loginResponse.userUuid)
        localStorage.setItem('userId', loginResponse.userId)
        localStorage.setItem('userName', loginResponse.userName)
        localStorage.setItem('userRole', loginResponse.userRole)

        set({
          isAuthenticated: true,
          accessToken: loginResponse.accessToken,
          userUuid: loginResponse.userUuid,
          userId: loginResponse.userId,
          userName: loginResponse.userName,
          userRole: loginResponse.userRole,
          areaUuid: loginResponse.areaUuid || null,
          isApproved: loginResponse.isApproved,
          error: null,
          isLoading: false,
        })
      },

      logout: async () => {
        logger.storeAction('authStore', 'logout')

        try {
          // 백엔드에 로그아웃 요청 (FCM 토큰 제거 포함)
          await authLogout()
          logger.info('로그아웃 성공', undefined, 'authStore', 'logout')
        } catch (error) {
          logger.storeError('authStore', 'logout', error)
        }

        // localStorage 정리
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userUuid')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userRole')
        localStorage.removeItem('fcm-token')

        set({
          ...initialState,
        })
      },

      updateToken: (accessToken: string) => {
        logger.storeAction('authStore', 'updateToken')
        set({
          accessToken,
        })
      },

      setError: (error: string | null) => {
        if (error) {
          logger.storeError('authStore', 'setError', error)
        }
        set({
          error,
          isLoading: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({
          isLoading: loading,
        })
      },

      clearAuth: () => {
        logger.storeAction('authStore', 'clearAuth')

        // 유틸리티 함수를 사용하여 모든 인증 관련 데이터 완전 제거
        clearAllAuthData()

        set({
          ...initialState,
        })
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        userUuid: state.userUuid,
        userId: state.userId,
        userName: state.userName,
        userRole: state.userRole,
        areaUuid: state.areaUuid,
        isApproved: state.isApproved,
      }),
    },
  ),
)

// 편의 선택자들
export const useAuth = () => {
  const authStore = useAuthStore()
  return {
    isAuthenticated: authStore.isAuthenticated,
    user: {
      userUuid: authStore.userUuid,
      userId: authStore.userId,
      userName: authStore.userName,
      userRole: authStore.userRole,
      areaUuid: authStore.areaUuid,
      isApproved: authStore.isApproved,
    },
    accessToken: authStore.accessToken,
    isLoading: authStore.isLoading,
    error: authStore.error,
  }
}

export const useUserRole = () => {
  const userRole = useAuthStore((state) => state.userRole)
  return userRole
}

export const useUserUuid = () => {
  const userUuid = useAuthStore((state) => state.userUuid)
  return userUuid
}

export const useAreaUuid = () => {
  const areaUuid = useAuthStore((state) => state.areaUuid)
  return areaUuid
}
