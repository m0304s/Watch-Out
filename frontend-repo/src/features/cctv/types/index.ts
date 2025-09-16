export interface AreaItem {
  areaUuid: string
  areaName: string
  areaAlias: string
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

export interface GetAreasParams {
  pageNum?: number
  display?: number
  search?: string
}


