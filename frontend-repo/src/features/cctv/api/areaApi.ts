import { api } from '@/apis/axios'
import type { GetAreasParams, PaginatedResponse, AreaItem } from '@/features/cctv/types'

const AREA_ENDPOINT = '/area'

export const getAreas = async (
  { pageNum = 0, display = 10, search = '' }: GetAreasParams = {},
): Promise<PaginatedResponse<AreaItem>> => {
  const response = await api.get<PaginatedResponse<AreaItem>>(AREA_ENDPOINT, {
    params: { pageNum, display, search },
  })
  return response.data
}


