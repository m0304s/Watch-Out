import { api } from '@/api/client'
import type {
  WatchListResponse,
  GetWatchListParams,
  CreateWatchRequest,
  WatchDetail,
  GetWatchDetailParams,
  UpdateWatchRequest,
  RentWatchRequest,
} from '@/features/watch/types'

// Watch API 엔드포인트 상수 관리
const WATCH_ENDPOINTS = {
  WATCHES: '/watch',
  RENT: (watchUuid: string) => `/watch/${watchUuid}/rent`,
  RETURN: (watchUuid: string) => `/watch/${watchUuid}/return`,
} as const

// 워치 목록 조회 API
export const getWatchList = async (
  params: GetWatchListParams = {},
): Promise<WatchListResponse> => {
  const { pageNum = 0, display = 10 } = params

  const queryParams = {
    pageNum,
    display,
  }

  const response = await api.get<WatchListResponse>(WATCH_ENDPOINTS.WATCHES, {
    params: queryParams,
  })

  return response.data
}

// 워치 등록 API
export const createWatch = async (
  request: CreateWatchRequest,
): Promise<void> => {
  await api.post(WATCH_ENDPOINTS.WATCHES, request)
}

// 워치 상세 조회 API
export const getWatchDetail = async (
  watchUuid: string,
  params: GetWatchDetailParams = {},
): Promise<WatchDetail> => {
  const { pageNum = 0, display = 10 } = params
  const response = await api.get<WatchDetail>(
    `${WATCH_ENDPOINTS.WATCHES}/${watchUuid}`,
    {
      params: { pageNum, display },
    },
  )
  return response.data
}

// 워치 수정 API (PATCH /watch/{watchUuid})
export const patchWatch = async (
  watchUuid: string,
  body: UpdateWatchRequest,
): Promise<WatchDetail> => {
  const response = await api.patch<WatchDetail>(
    `${WATCH_ENDPOINTS.WATCHES}/${watchUuid}`,
    body,
  )
  return response.data
}

// 워치 삭제 API (DELETE /watch/{watchUuid})
export const deleteWatch = async (watchUuid: string): Promise<void> => {
  await api.delete(`${WATCH_ENDPOINTS.WATCHES}/${watchUuid}`)
}

// 워치 대여 API (POST /watch/{watchUuid}/rent)
export const rentWatch = async (
  watchUuid: string,
  body: RentWatchRequest,
): Promise<void> => {
  await api.post(WATCH_ENDPOINTS.RENT(watchUuid), body)
}

// 워치 반납 API (POST /watch/{watchUuid}/return)
export const returnWatch = async (watchUuid: string): Promise<void> => {
  await api.post(WATCH_ENDPOINTS.RETURN(watchUuid))
}

// Watch API 객체로 내보내기
export const watchApi = {
  getWatchList,
  createWatch,
  getWatchDetail,
  patchWatch,
  deleteWatch,
  rentWatch,
  returnWatch,
}
