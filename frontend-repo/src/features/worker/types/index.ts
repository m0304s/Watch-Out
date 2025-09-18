export type TrainingStatus = 'COMPLETED' | 'EXPIRED' | 'NOT_COMPLETED'
export type UserRole = 'WORKER' | 'AREA_ADMIN'
export type Gender = 'MALE' | 'FEMALE'
export type BloodType = 'A' | 'B' | 'AB' | 'O'
export type RhFactor = 'PLUS' | 'MINUS'

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

// 작업자 상세 정보 타입
export interface WorkerDetail {
  userUuid: string
  userId: string
  userName: string
  companyName: string
  areaName: string
  contact: string
  emergencyContact: string
  gender: Gender
  bloodType: BloodType
  rhFactor: RhFactor
  trainingStatus: TrainingStatus
  trainingCompletedAt: string
  userRole: UserRole
  watchId: number
  photoUrl: string
  assignedAt: string
}

// 사용자 역할 변경 요청 타입
export interface UpdateUserRoleRequest {
  userUuid: string
  newRole: 'WORKER' | 'AREA_ADMIN'
}