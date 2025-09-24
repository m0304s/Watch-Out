import { apiClient } from '@/api/client'
import type {
  FCMTokenRequest,
  FCMTokenResponse,
} from '@/features/notification/types'

export const fcmApi = {
  // FCM 토큰 등록
  async registerToken(token: string): Promise<FCMTokenResponse> {
    console.log('📡 FCM 토큰 등록 API 호출 시작...')
    console.log('🎫 등록할 토큰:', token.substring(0, 20) + '...')
    console.log('🌐 API 엔드포인트:', '/fcm/token')

    try {
      const requestData = { token } as FCMTokenRequest
      console.log('📦 요청 데이터:', requestData)

      const response = await apiClient.post<FCMTokenResponse>(
        '/fcm/token',
        requestData,
      )
      console.log('✅ FCM 토큰 등록 API 응답 성공!')
      console.log('📊 응답 데이터:', response.data)
      console.log('📊 응답 상태:', response.status)

      return response.data
    } catch (error) {
      console.error('💥 FCM 토큰 등록 API 실패!')
      console.error('💥 에러 객체:', error)
      console.error('💥 에러 타입:', typeof error)
      if (error instanceof Error) {
        console.error('💥 에러 메시지:', error.message)
        console.error('💥 에러 스택:', error.stack)
      }
      throw error
    }
  },

  // FCM 토큰 삭제
  async removeToken(token: string): Promise<void> {
    console.log('📡 FCM 토큰 삭제 API 호출 시작...')
    console.log('🎫 삭제할 토큰:', token.substring(0, 20) + '...')
    console.log('🌐 API 엔드포인트:', '/fcm/token/remove')

    try {
      const requestData = { token } as FCMTokenRequest
      console.log('📦 요청 데이터:', requestData)

      const response = await apiClient.post('/fcm/token/remove', requestData)
      console.log('✅ FCM 토큰 삭제 API 응답 성공!')
      console.log('📊 응답 상태:', response.status)
    } catch (error) {
      console.error('💥 FCM 토큰 삭제 API 실패!')
      console.error('💥 에러 객체:', error)
      console.error('💥 에러 타입:', typeof error)
      if (error instanceof Error) {
        console.error('💥 에러 메시지:', error.message)
        console.error('💥 에러 스택:', error.stack)
      }
      throw error
    }
  },

  // 내 FCM 토큰 목록 조회
  async getMyTokens(): Promise<FCMTokenResponse> {
    console.log('📡 FCM 토큰 목록 조회 API 호출 시작...')
    console.log('🌐 API 엔드포인트:', '/fcm/tokens')

    try {
      const response = await apiClient.get<FCMTokenResponse>('/fcm/tokens')
      console.log('✅ FCM 토큰 목록 조회 API 응답 성공!')
      console.log('📊 응답 데이터:', response.data)
      console.log('📊 응답 상태:', response.status)

      return response.data
    } catch (error) {
      console.error('💥 FCM 토큰 목록 조회 API 실패!')
      console.error('💥 에러 객체:', error)
      console.error('💥 에러 타입:', typeof error)
      if (error instanceof Error) {
        console.error('💥 에러 메시지:', error.message)
        console.error('💥 에러 스택:', error.stack)
      }
      throw error
    }
  },
}
