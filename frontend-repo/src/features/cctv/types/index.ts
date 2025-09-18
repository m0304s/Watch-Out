export interface AreaItem {
  areaUuid: string
  areaName: string
  areaAlias: string
  managerName: string
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

// CCTV 목록 아이템 타입
export interface CctvItem {
  cctvUuid: string
  cctvName: string
  cctvUrl: string
  isOnline: boolean
  type: 'ACCESS' | 'CCTV'
  areaUuid: string
  areaName: string
}

// CCTV 목록 조회 파라미터
export interface GetCctvParams {
  pageNum?: number
  display?: number
  areaUuid?: string
  isOnline?: boolean
  search?: string
}

export interface GetAreasParams {
  pageNum?: number
  display?: number
  search?: string
}

// 구역 생성 요청 타입
export interface CreateAreaRequest {
  areaName: string
  areaAlias: string
}

// 구역 수정 요청 타입
export interface UpdateAreaRequest {
  areaName: string
  areaAlias: string
}

// 담당자 지정 요청 타입
export interface AssignManagerRequest {
  userUuid: string
  areaUuid: string
}

// AREA_ADMIN 사용자 타입
export interface AreaAdminUser {
  userUuid: string
  userId: string
  userName: string
  userRole: 'AREA_ADMIN'
}

// 사용자 검색 파라미터 타입
export interface SearchUsersParams {
  pageNum?: number
  display?: number
  search?: string
  userRole?: 'AREA_ADMIN'
}

// 구역 상세 정보 조회 파라미터 타입
export interface GetAreaDetailParams {
  areaUuid: string
  pageNum?: number
  display?: number
}

// 구역 근로자 정보 타입
export interface AreaWorker {
  userUuid: string
  userName: string
  userId: string
}

// 구역 상세 정보 응답 타입
export interface AreaDetail {
  areaUuid: string
  areaName: string
  areaAlias: string
  managerUuid: string
  managerName: string
  workers: PaginatedResponse<AreaWorker>
}

// CCTV 생성 요청 타입
export interface CreateCctvRequest {
  cctvName: string
  cctvUrl: string
  isOnline: boolean
  type: 'ACCESS' | 'CCTV'
  areaUuid: string
}

// CCTV 수정 요청 타입
export interface UpdateCctvRequest {
  cctvName: string
  cctvUrl: string
  isOnline: boolean
  type: 'ACCESS' | 'CCTV'
  areaUuid: string
}
