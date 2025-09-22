import apiClient from '@/apis/axios'
import type {
  AreaListRequest,
  AreaListResponse,
  AreaCountResponse,
  AreaDetailRequest,
  AreaDetailResponse,
  MyAreaResponse,
} from '@/features/area/types/area'

export const areaAPI = {
  getAreaCount: async (): Promise<AreaCountResponse> => {
    const response = await apiClient.get('/area/my-area-count')
    return response.data
  },

  getAreaList: async (
    requestData: AreaListRequest,
  ): Promise<AreaListResponse> => {
    const response = await apiClient.get('/area', { params: requestData })
    return response.data
  },

  getArea: async (
    requestData: AreaDetailRequest,
  ): Promise<AreaDetailResponse> => {
    const response = await apiClient.get(`/area/${requestData.areaUuid}`, {
      params: requestData,
    })
    return response.data
  },

  getMyArea: async (): Promise<MyAreaResponse> => {
    const response = await apiClient.get(`/area/mine`)
    return response.data
  }
}
