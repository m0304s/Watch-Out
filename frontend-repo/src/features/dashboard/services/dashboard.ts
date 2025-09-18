import apiClient from '@/apis/axios'
import type {
  SafetyScoreRequest,
  SafetyScoreResponse,
} from '@/features/dashboard/types/dashboard'

export const dashboardAPI = {
  getSafetyScore: async (
    requestData: SafetyScoreRequest,
  ): Promise<SafetyScoreResponse> => {
    const response = await apiClient.post(
      '/dashboard/safety-scores',
      requestData,
    )
    return response.data
  },
}
