import apiClient from '@/apis/axios'
import type {
  CctvListRequest,
  CctvListResponse,
} from '@/features/area/types/cctv'

export const cctvAPI = {
  getCctvList: async (
    requestData: CctvListRequest,
  ): Promise<CctvListResponse> => {
    const response = await apiClient.get('/cctv', { params: requestData })
    return response.data
  },
}
