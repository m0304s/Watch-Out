import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const isDevelopment = import.meta.env.DEV

// axios 인스턴스 생성 (기본 설정 포함)
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, // 절대 경로로 명시
  timeout: 30000,
  withCredentials: true, // 쿠키 자동 전송을 위해 true로 설정
  headers: {
    'Content-Type': 'application/json',
  },
})

// 생성된 axios 인스턴스의 baseURL 확인 로그
console.log('🔧 apiClient baseURL:', apiClient.defaults.baseURL)

// 🐛 개발 환경에서 요청/응답 로깅
if (isDevelopment) {
  // 요청 로그
  apiClient.interceptors.request.use((request) => {
    console.log('🚀 API Request:', request.method?.toUpperCase(), request.url)
    console.log('🌐 Full URL:', `${request.baseURL}${request.url}`)
    if (request.data) {
      console.log('📤 Request Data:', request.data)
    }
    return request
  })

  // 응답 로그
  apiClient.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', response.status, response.config.url)
      console.log('📥 Response Data:', response.data)
      return response
    },
    (error) => {
      console.log(
        '❌ API Error:',
        error.response?.status,
        error.config?.url,
        error.message,
      )
      if (error.response?.data) {
        console.log('📥 Error Data:', error.response.data)
        console.log(
          '📥 Error Details:',
          JSON.stringify(error.response.data, null, 2),
        )
      }
      return Promise.reject(error)
    },
  )
}

// 인증을 위한 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 액세스 토큰 가져오기
    const token = localStorage.getItem('accessToken')

    // 토큰 재발급 및 로그인 요청에는 Authorization 헤더를 붙이지 않음
    const url = config.url || ''
    const isAuthReissue = url.includes('/auth/reissue')
    const isAuthLogin = url.includes('/auth/login')

    if (!isAuthReissue && !isAuthLogin && token) {
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
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true

    //   try {
    //     console.log('토큰 갱신 시도...')

    //     // 토큰 갱신 API 호출 (refreshToken은 쿠키로 자동 전송됨)
    //     const response = await apiClient.post('/auth/reissue', undefined, { withCredentials: true })

    //     // 새로운 accessToken을 localStorage에 저장
    //     if (response.data?.result?.accessToken) {
    //       localStorage.setItem('accessToken', response.data.result.accessToken)

    //       // 원래 요청의 Authorization 헤더 업데이트
    //       originalRequest.headers.Authorization = `Bearer ${response.data.result.accessToken}`

    //       console.log('토큰 갱신 성공')

    //       // 원래 요청 재시도
    //       return apiClient(originalRequest)
    //     }
    //   } catch (refreshError) {
    //     console.error('토큰 갱신 실패:', refreshError)

    //     // 토큰 갱신 실패 시 localStorage에서 토큰 제거
    //     localStorage.removeItem('accessToken')

    //     // 로그인 페이지로 리다이렉트
    //     window.location.href = '/login'
    //   }
    // }

    // return Promise.reject(error)
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

export default apiClient
