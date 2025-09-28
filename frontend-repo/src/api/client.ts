import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { clearAllAuthData } from '@/utils/logout'
import type { ApiResponse } from '@/types/common'
import { logger } from '@/utils/logger'

// 모바일 환경 감지 (Capacitor 사용)
const isMobile =
  window.location.protocol === 'capacitor:' ||
  (window as any).Capacitor?.isNativePlatform()

// API URL 설정 (웹과 모바일 모두 배포 서버 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://j13e102.p.ssafy.io:8443/api'

logger.info(
  'API 클라이언트 초기화',
  {
    isMobile,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    isProd: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    viteMobileUrl: import.meta.env.VITE_MOBILE_API_URL,
    viteApiUrl: import.meta.env.VITE_API_BASE_URL || 'https://j13e102.p.ssafy.io:8443/api',
    baseURL: API_BASE_URL,
  },
  'API',
  'initialize',
)

const isDevelopment = import.meta.env.DEV
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

// axios 인스턴스 생성 (기본 설정 포함)
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true, // 쿠키 자동 전송을 위해 true로 설정
  headers: {
    'Content-Type': 'application/json',
  },
})

// 생성된 axios 인스턴스의 baseURL 확인 로그
logger.debug(
  'API 클라이언트 baseURL 설정',
  { baseURL: apiClient.defaults.baseURL },
  'API',
  'config',
)

// 🐛 개발 환경에서 요청/응답 로깅
if (isDevelopment) {
  // 요청 로그
  apiClient.interceptors.request.use((request) => {
    logger.apiRequest(
      request.method?.toUpperCase() || 'UNKNOWN',
      request.url || '',
      request.data,
    )
    return request
  })

  // 응답 로그
  apiClient.interceptors.response.use(
    (response) => {
      logger.apiResponse(
        response.config.method?.toUpperCase() || 'UNKNOWN',
        response.config.url || '',
        response.status,
        response.data,
      )
      return response
    },
    (error) => {
      logger.apiError(
        error.config?.method?.toUpperCase() || 'UNKNOWN',
        error.config?.url || '',
        error,
      )
      return Promise.reject(error)
    },
  )
}

// 인증을 위한 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 액세스 토큰 가져오기
    const token = localStorage.getItem('accessToken')

    // 인증이 필요하지 않은 공개 API들 (Authorization 헤더 제외)
    const url = config.url || ''
    const publicEndpoints = [
      '/auth/reissue',
      '/auth/login',
      '/user/signup',
      '/company',
      '/s3/photo/presigned-url',
    ]

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      url.includes(endpoint),
    )

    // 공개 엔드포인트가 아니고 토큰이 있을 때만 Authorization 헤더 추가
    if (!isPublicEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 쿠키 기반 인증 필요 요청에 대해 항상 쿠키 포함
    config.withCredentials = true
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 에러 처리를 위한 응답 인터셉터 (토큰 갱신 로직 포함)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 Unauthorized 에러 처리 (토큰 만료)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || ''

      // 공개 엔드포인트에 대해서는 토큰 갱신을 시도하지 않음
      const publicEndpoints = [
        '/auth/reissue',
        '/auth/login',
        '/user/signup',
        '/company',
        '/s3/photo/presigned-url',
      ]

      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        url.includes(endpoint),
      )

      if (isPublicEndpoint) {
        logger.warn(
          '공개 엔드포인트 401 에러 - 토큰 갱신 시도하지 않음',
          { url },
          'API',
          'auth',
        )
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        logger.info('토큰 갱신 시도', { url }, 'API', 'token-refresh')

        // 토큰 갱신 API 호출 (refreshToken은 쿠키로 자동 전송됨)
        const response = await apiClient.post('/auth/reissue', undefined, {
          withCredentials: true,
        })

        // 새로운 accessToken을 localStorage에 저장
        if (response.data?.result?.accessToken) {
          const newToken = response.data.result.accessToken
          localStorage.setItem('accessToken', newToken)

          // 메모리 스토어 토큰도 동기화
          useAuthStore.getState().updateToken(newToken)

          // 원래 요청의 Authorization 헤더 업데이트
          originalRequest.headers.Authorization = `Bearer ${newToken}`

          logger.info('토큰 갱신 성공', { url }, 'API', 'token-refresh')

          // 원래 요청 재시도
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        logger.error('토큰 갱신 실패', refreshError, 'API', 'token-refresh')

        // 토큰 갱신 실패 시 모든 인증 데이터 완전 제거
        clearAllAuthData()

        // 메모리 스토어도 초기화
        try {
          useAuthStore.getState().clearAuth()
        } catch (_) {
          // no-op
        }

        // 로그인 페이지로 리다이렉트
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

// 타입 안전한 API 헬퍼 함수들
export const api = {
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return apiClient.get<T>(url, config)
  },

  post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return apiClient.post<T>(url, data, config)
  },

  put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return apiClient.put<T>(url, data, config)
  },

  patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return apiClient.patch<T>(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return apiClient.delete<T>(url, config)
  },
}

// 공통 에러 처리 함수
export const handleApiError = (error: any): string => {
  logger.error('API 에러 발생', error, 'API', 'error-handling')

  // 네트워크 에러
  if (!error.response) {
    return '네트워크 연결을 확인해주세요.'
  }

  // 서버 응답 에러
  const { status, data } = error.response

  // 서버에서 제공하는 에러 메시지
  if (data?.message) {
    return data.message
  }

  // HTTP 상태 코드별 에러 메시지
  switch (status) {
    case 400:
      return '잘못된 요청입니다.'
    case 401:
      return '인증이 필요합니다. 다시 로그인해주세요.'
    case 403:
      return '접근 권한이 없습니다.'
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.'
    case 409:
      return '데이터 충돌이 발생했습니다.'
    case 422:
      return '입력 데이터를 확인해주세요.'
    case 429:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    case 500:
      return '서버 내부 오류가 발생했습니다.'
    case 502:
      return '서버가 일시적으로 사용할 수 없습니다.'
    case 503:
      return '서버가 점검 중입니다.'
    case 504:
      return '요청 시간이 초과되었습니다.'
    default:
      if (status >= 500) {
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      return error.message || '알 수 없는 오류가 발생했습니다.'
  }
}

export default apiClient
