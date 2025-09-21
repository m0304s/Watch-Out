export type WatchStatus = 'IN_USE' | 'AVAILABLE' | 'UNAVAILABLE'

export interface Watch {
  watchUuid: string
  watchId: number
  modelName: string
  status: WatchStatus
  rentedAt: string | null
  note: string
  userName: string | null
}

export interface Pagination {
  pageNum: number
  display: number
  totalItems: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface WatchListResponse {
  data: Watch[]
  pagination: Pagination
}

export interface GetWatchListParams {
  pageNum?: number
  display?: number
}

export interface CreateWatchRequest {
  modelName: string
  note: string
}

// 대여 요청 타입
export interface RentWatchRequest {
  userUuid: string
}

// 상세 조회 응답 타입
export interface WatchDetailHistoryEntry {
  userUuid: string
  userId: string
  userName: string
  rentedAt: string
  returnedAt: string | null
}

export interface WatchHistory {
  data: WatchDetailHistoryEntry[]
  pagination: Pagination
}

export interface WatchDetail {
  watchUuid: string
  watchId: number
  modelName: string
  status: WatchStatus
  createdAt: string
  note: string
  history: WatchHistory
}

// 수정 요청 타입 (PATCH - 부분수정 허용)
export interface UpdateWatchRequest {
  modelName?: string
  status?: WatchStatus
  note?: string
}

export interface GetWatchDetailParams {
  pageNum?: number
  display?: number
}
