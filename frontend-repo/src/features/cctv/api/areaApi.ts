import { api } from '@/api/client'
import type {
  GetAreasParams,
  PaginatedResponse,
  AreaItem,
  CreateAreaRequest,
  UpdateAreaRequest,
  AssignManagerRequest,
  AreaAdminUser,
  SearchUsersParams,
  GetAreaDetailParams,
  AreaDetail,
} from '@/features/cctv/types'

const AREA_ENDPOINT = '/area'
const USER_ENDPOINT = '/user'

// 구역 목록 조회
export const getAreas = async ({
  pageNum = 0,
  display = 10,
  search = '',
}: GetAreasParams = {}): Promise<PaginatedResponse<AreaItem>> => {
  const response = await api.get<PaginatedResponse<AreaItem>>(AREA_ENDPOINT, {
    params: { pageNum, display, search },
  })
  return response.data
}

// 구역 생성
export const createArea = async (data: CreateAreaRequest): Promise<void> => {
  await api.post(AREA_ENDPOINT, data)
}

// 구역 수정
export const updateArea = async (
  areaUuid: string,
  data: UpdateAreaRequest,
): Promise<void> => {
  await api.put(`${AREA_ENDPOINT}/${areaUuid}`, data)
}

// 구역 삭제
export const deleteArea = async (areaUuid: string): Promise<void> => {
  await api.delete(`${AREA_ENDPOINT}/${areaUuid}`)
}

// AREA_ADMIN 사용자 검색 (담당자 지정용)
export const searchAreaAdmins = async ({}: SearchUsersParams = {}): Promise<
  PaginatedResponse<AreaAdminUser>
> => {
  const response = await api.get<PaginatedResponse<AreaAdminUser>>(
    `${USER_ENDPOINT}`,
    {
      params: { userRole: 'AREA_ADMIN' },
    },
  )
  return response.data
}

// 담당자 지정
export const assignManager = async (
  data: AssignManagerRequest,
): Promise<void> => {
  await api.post(`${USER_ENDPOINT}/area/admin`, data)
}

// 구역 상세 정보 조회
export const getAreaDetail = async ({
  areaUuid,
  pageNum = 0,
  display = 10,
}: GetAreaDetailParams): Promise<AreaDetail> => {
  const response = await api.get<AreaDetail>(`${AREA_ENDPOINT}/${areaUuid}`, {
    params: { pageNum, display },
  })
  return response.data
}
