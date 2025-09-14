import { api } from '@/apis/axios'
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  CompanyOption,
} from '@/features/auth/types'

// Auth API 엔드포인트 상수 관리
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REISSUE: '/auth/reissue',
  SIGNUP: '/user/signup',
  COMPANIES: '/company', // 회사 목록 조회용 (회원가입 시 필요)
} as const

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean
  result?: T
  message?: string
  code?: string
}

interface RefreshTokenResponse {
  accessToken: string
}

// 로그인 API
export const login = async (loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, loginData)
  
  // 로그인 성공 시 토큰을 localStorage에 저장
  if (response.data?.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken)
  }
  
  // 서버 응답을 ApiResponse 형태로 래핑
  return {
    success: true,
    result: response.data
  }
}

// 로그아웃 API
export const logout = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await api.post<ApiResponse<void>>(AUTH_ENDPOINTS.LOGOUT)
    
    // 로그아웃 성공 시 토큰 제거
    localStorage.removeItem('accessToken')
    
    return response.data
  } catch (error) {
    // 에러가 발생해도 로컬 토큰은 제거
    localStorage.removeItem('accessToken')
    throw error
  }
}

// 토큰 재발급 API
export const refreshToken = async (): Promise<ApiResponse<RefreshTokenResponse>> => {
  const response = await api.post<ApiResponse<RefreshTokenResponse>>(AUTH_ENDPOINTS.REISSUE)
  return response.data
}

// 회원가입 API
export const signup = async (signupData: SignUpRequest): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>(AUTH_ENDPOINTS.SIGNUP, signupData)
  
  // 서버가 빈 응답이나 { success: boolean } 형태를 보낼 수 있음
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data
  }
  
  // 빈 응답이거나 예상과 다른 형태일 때 성공으로 처리
  return {
    success: true,
    result: undefined
  }
}

// 회사 목록 조회 API (회원가입 시 필요)
// 서버가 배열 또는 { success, result } 형태 중 하나를 반환할 수 있어 유연하게 처리
export const getCompanies = async (): Promise<CompanyOption[]> => {
  const response = await api.get<CompanyOption[] | ApiResponse<CompanyOption[]>>(AUTH_ENDPOINTS.COMPANIES)
  const data = response.data as unknown
  if (Array.isArray(data)) {
    return data
  }
  if (data && typeof data === 'object' && Array.isArray((data as ApiResponse<CompanyOption[]>).result)) {
    return (data as ApiResponse<CompanyOption[]>)?.result ?? []
  }
  return []
}

// 토큰 유효성 검사 (로컬 스토리지에서 토큰 확인)
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken')
  return !!token
}

// 현재 저장된 토큰 가져오기
export const getStoredToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

// Auth API 객체로 내보내기 (기존 코드와의 호환성을 위해)
export const authAPI = {
  login,
  logout,
  refreshToken,
  signup,
  getCompanies,
  isAuthenticated,
  getStoredToken,
}

export default authAPI
