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

export interface CctvViewAreaItem {
  uuid: string
  name: string
  springProxyUrl: string
  fastapiMjpegUrl: string
  online: boolean
}

export interface CctvViewAreaRequest {
  areaUuid: string
  useFastapiMjpeg: boolean
}

export interface CctvViewAreaResponse {
  areaUuid: string
  useFastapiMjpeg: boolean
  items: CctvViewAreaItem[]
}
