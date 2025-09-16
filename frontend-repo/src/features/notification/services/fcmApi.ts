import apiClient from '@/api'
import type { FCMTokenRequest, FCMTokenResponse } from '../types'

export const fcmApi = {
  // FCM 토큰 등록
  async registerToken(token: string): Promise<FCMTokenResponse> {
    const response = await apiClient.post<FCMTokenResponse>('/fcm/token', {
      token
    } as FCMTokenRequest)
    return response.data
  },

  // FCM 토큰 삭제
  async removeToken(token: string): Promise<void> {
    await apiClient.post('/fcm/token/remove', {
      token
    } as FCMTokenRequest)
  },

  // 내 FCM 토큰 목록 조회
  async getMyTokens(): Promise<FCMTokenResponse> {
    const response = await apiClient.get<FCMTokenResponse>('/fcm/tokens')
    return response.data
  }
}
