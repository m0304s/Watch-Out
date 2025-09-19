import apiClient from '@/apis/axios'
import type {
  SafetyScoreRequest,
  SafetyScoreResponse,
  ViolationStatusRequest,
  ViolationStatusResponse,
  AccidentStatusRequest,
  AccidentStatusResponse,
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

  postViolationStatus: async (
    requestData: ViolationStatusRequest,
  ): Promise<ViolationStatusResponse> => {
    const response = await apiClient.post(
      '/dashboard/safety-violation-status',
      requestData,
    )
    return response.data
  },

  postAccidentStatus: async (
    requestData: AccidentStatusRequest,
  ): Promise<AccidentStatusResponse> => {
    const response = await apiClient.post(
      '/dashboard/accident-status',
      requestData,
    )
    return response.data
  },
}
