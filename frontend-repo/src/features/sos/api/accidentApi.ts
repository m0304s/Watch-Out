import { apiClient } from '@/apis/axios'
import type { AccidentRequest, AccidentResponse } from '@/features/sos/types'

export const accidentApi = {
  /**
   * 사고 신고 API
   * @param data 사고 신고 데이터
   * @returns 사고 신고 결과
   */
  reportAccident: async (data: AccidentRequest): Promise<AccidentResponse> => {
    const response = await apiClient.post<AccidentResponse>('/accident', data)
    return response.data
  },
}
