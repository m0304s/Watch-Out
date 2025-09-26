// 공통 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  result?: T
  message?: string
  error?: string
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
}

// 페이지네이션 요청 파라미터
export interface PaginationParams {
  pageNum?: number
  display?: number
  search?: string
}

// 사용자 역할 타입
export type UserRole = 'WORKER' | 'AREA_ADMIN' | 'ADMIN'

// 훈련 상태 타입
export type TrainingStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'

// 공통 상태 타입
export interface LoadingState {
  loading: boolean
  error: string | null
}

// 공통 선택 옵션 타입
export interface SelectOption {
  value: string
  label: string
}

// 공통 ID 타입
export interface BaseEntity {
  uuid: string
  createdAt?: string
  updatedAt?: string
}

// 파일 업로드 관련 타입
export interface FileUploadResponse {
  uploadUrl: string
  fileUrl: string
}

// 위치 정보 타입
export interface LocationData {
  latitude: number
  longitude: number
  address?: string
}

// 날짜 범위 타입
export interface DateRange {
  startDate: string
  endDate: string
}

// 정렬 옵션 타입
export interface SortOption {
  field: string
  direction: 'ASC' | 'DESC'
}

// 필터 옵션 타입
export interface FilterOption {
  field: string
  value: any
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in'
}

// 공통 에러 타입
export interface ApiError {
  code: string
  message: string
  details?: any
}

// 공통 성공 응답 타입
export interface SuccessResponse {
  success: true
  message?: string
}

// 공통 실패 응답 타입
export interface ErrorResponse {
  success: false
  error: string
  code?: string
}
