// 공통 타입들
export * from './common'

// API 관련 타입들
export interface ApiClient {
  get<T = any>(url: string, config?: any): Promise<{ data: T }>
  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: any,
  ): Promise<{ data: T }>
  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: any,
  ): Promise<{ data: T }>
  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: any,
  ): Promise<{ data: T }>
  delete<T = any>(url: string, config?: any): Promise<{ data: T }>
}

// 스토어 관련 타입들
export interface StoreState {
  loading: boolean
  error: string | null
}

export interface StoreActions {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// 컴포넌트 관련 타입들
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export interface FormProps extends ComponentProps {
  onSubmit: (data: any) => void
  onCancel?: () => void
  loading?: boolean
}

// 플랫폼 관련 타입들
export type Platform = 'web' | 'mobile'

export interface PlatformConfig {
  isMobile: boolean
  isWeb: boolean
  userAgent: string
}

// 환경 설정 타입들
export interface EnvironmentConfig {
  apiBaseUrl: string
  timeout: number
  isDevelopment: boolean
  isProduction: boolean
}

// 로깅 관련 타입들
export interface LogLevel {
  DEBUG: 'debug'
  INFO: 'info'
  WARN: 'warn'
  ERROR: 'error'
}

export interface LogEntry {
  level: keyof LogLevel
  message: string
  timestamp: Date
  context?: any
}
