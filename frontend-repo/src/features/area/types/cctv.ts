export interface CctvListRequest {
  areaUuid?: string
  isOnline?: boolean
  search?: string
  pageNum: number
  display: number
}

export interface CctvItem {
  cctvUuid: string
  cctvName: string
  cctvUrl: string
  isOnline: boolean
  areaUuid: string
  areaName: string
  type: string
}

export interface CctvListResponse {
  data: CctvItem[]
  pagination: {
    pageNum: number
    display: number
    totalItems: number
    totalPages: number
  }
}
