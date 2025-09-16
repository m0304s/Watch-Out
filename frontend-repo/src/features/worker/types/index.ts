export type TrainingStatus = 'COMPLETED' | 'EXPIRED'

export interface Employee {
  userUuid: string
  userId: string
  userName: string
  companyName: string
  areaName: string
  trainingStatus: TrainingStatus
  lastEntryTime: string
}

export interface Pagination {
  pageNum: number
  display: number
  totalItems: number
  totalPages: number
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


