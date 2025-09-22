import { useState } from 'react'
import { accidentApi } from '@/features/sos/api/accidentApi'
import type { AccidentRequest } from '@/features/sos/types'

export const useAccident = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reportAccident = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const requestData: AccidentRequest = {
        accidentType: 'MANUAL_SOS',
      }

      const response = await accidentApi.reportAccident(requestData)
      return response
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '사고 신고 중 오류가 발생했습니다.'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    reportAccident,
    isLoading,
    error,
  }
}
