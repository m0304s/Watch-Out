import { api } from '@/apis/axios'
import type {
  CctvItem,
  GetCctvParams,
  PaginatedResponse,
  CreateCctvRequest,
  UpdateCctvRequest,
} from '@/features/cctv/types'

const CCTV_ENDPOINT = '/cctv'

// CCTV 목록 조회
export const getCctvs = async ({
  pageNum = 0,
  display = 10,
  areaUuid = '',
  isOnline,
  search = '',
}: GetCctvParams = {}): Promise<PaginatedResponse<CctvItem>> => {
  const response = await api.get<PaginatedResponse<CctvItem>>(CCTV_ENDPOINT, {
    params: {
      pageNum,
      display,
      areaUuid,
      isOnline,
      search,
    },
  })
  return response.data
}

// CCTV 생성
export const createCctv = async (data: CreateCctvRequest): Promise<void> => {
  await api.post(CCTV_ENDPOINT, data)
}

// CCTV 수정
export const updateCctv = async (
  cctvUuid: string,
  data: UpdateCctvRequest,
): Promise<void> => {
  await api.put(`${CCTV_ENDPOINT}/${cctvUuid}`, data)
}

// CCTV 삭제
export const deleteCctv = async (cctvUuid: string): Promise<void> => {
  await api.delete(`${CCTV_ENDPOINT}/${cctvUuid}`)
}

export const cctvApi = {
  getCctvs,
  createCctv,
  updateCctv,
  deleteCctv,
}

export {}
