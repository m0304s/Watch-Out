import { useEffect } from 'react'
import { useWeatherStore, initializeWeatherStore } from '@/stores/weatherStore'

export const useWeatherOptimized = () => {
  const { data, location, loading, error, fetchWeather } = useWeatherStore()

  useEffect(() => {
    // 스토어 초기화 (캐시 확인 및 주기적 업데이트 시작)
    initializeWeatherStore()

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 주기적 업데이트는 전역적으로 관리되므로 여기서는 정리하지 않음
      // 앱 전체가 언마운트될 때만 정리됨
    }
  }, [])

  return {
    data,
    location,
    loading,
    error,
    refetch: () => fetchWeather(true),
  }
}
