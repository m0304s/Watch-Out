export interface AreaListRequest {
  search?: string
  pageNum: number
  display: number
}

export interface AreaListItem {
  areaUuid: string
  areaName: string
  areaAlias: string
  managerUuid: string
  managerName: string
}

export interface Worker {
  userUuid: string
  userName: string
  userId: string
}

export interface Pagination {
  pageNum: number
  display: number
  totalItems: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AreaListResponse {
  data: AreaListItem[]
  workers: {
    data: Worker[]
    pagination: Pagination
  }
}

export interface AreaDetailRequest {
  areaUuid: string
  pageNum: number
  display: number
}

export interface Worker {
  userUuid: string
  userName: string
  userId: string
}

export interface AreaDetailResponse {
  areaUuid: string
  areaName: string
  areaAlias: string
  managerUuid: string
  managerName: string
  workers: {
    data: Worker[]
    pagination: Pagination
  }
}

export interface AreaCountResponse {
  areaCount: number
}
