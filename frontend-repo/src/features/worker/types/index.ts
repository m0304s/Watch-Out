export type TrainingStatus = 'COMPLETED' | 'EXPIRED' | 'NOT_COMPLETED'
export type UserRole = 'WORKER' | 'AREA_ADMIN'

export interface Employee {
  userUuid: string
  userId: string
  userName: string
  companyName: string
  areaName: string
  trainingStatus: TrainingStatus
  lastEntryTime: string
  userRole: UserRole
  photoUrl: string
}

export interface Pagination {
  pageNum: number
  display: number
  totalItems: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface WorkerFilterState {
  search: string
  companies: string[]
  areas: string[]
  statuses: TrainingStatus[]
  sortKey: 'lastEntryTime' | 'userName'
  sortOrder: 'asc' | 'desc'
}

// API 요청 파라미터 타입
export interface GetEmployeesParams {
  areaUuid?: string
  trainingStatus?: TrainingStatus
  search?: string
  userRole?: UserRole
  pageNum?: number
  display?: number
}

// 구역(Area) 타입
export interface AreaOption {
  areaUuid: string
  areaName: string
  areaAlias?: string | null
}
