import { apiClient } from '@/api/client'
import type {
  CctvListRequest,
  CctvListResponse,
  CctvViewAreaRequest,
  CctvViewAreaResponse,
} from '@/features/area/types/cctv'

export const cctvAPI = {
  getCctvList: async (
    requestData: CctvListRequest,
  ): Promise<CctvListResponse> => {
    const response = await apiClient.get('/cctv', { params: requestData })
    return response.data
  },

  getCctvViewArea: async (
    requestData: CctvViewAreaRequest,
  ): Promise<CctvViewAreaResponse> => {
    const response = await apiClient.get('/cctv/views/area', {
      params: requestData,
    })
    return response.data
  },
}
