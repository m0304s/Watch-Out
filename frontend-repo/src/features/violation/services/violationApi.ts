import { apiClient } from '@/api/client'

export interface ViolationDetail {
  violationUuid: string
  areaName: string
  cctvName: string
  violationTypes: string[]
  imageUrl: string
  createdAt: string
}

export const violationApi = {
  /**
   * violation UUID로 상세 정보 조회
   */
  getViolationDetail: async (
    violationUuid: string,
  ): Promise<ViolationDetail> => {
    const response = await apiClient.get(`/violations/${violationUuid}`)
    return response.data
  },
}
