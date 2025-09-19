import { useState, useEffect, useRef } from 'react'
import { weatherService } from '@/features/weather/services/weatherService'
import type { WeatherState, LocationData } from '@/features/weather'

// 캐시 키 상수
const WEATHER_CACHE_KEY = 'weather_data'
const LOCATION_CACHE_KEY = 'location_data'
const CACHE_EXPIRY_KEY = 'weather_cache_expiry'

// 캐시 만료 시간 (10분)
const CACHE_DURATION = 10 * 60 * 1000

export const useWeather = () => {
  const [state, setState] = useState<WeatherState>({
    data: null,
    location: null,
    loading: true,
    error: null,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 캐시에서 데이터 가져오기
  const getCachedData = () => {
    try {
      const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY)
      const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY)
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY)

      if (cachedWeather && cachedLocation && cacheExpiry) {
        const expiryTime = parseInt(cacheExpiry, 10)
        const now = Date.now()

        // 캐시가 아직 유효한 경우
        if (now < expiryTime) {
          return {
            weather: JSON.parse(cachedWeather),
            location: JSON.parse(cachedLocation),
          }
        }
      }
    } catch (error) {
      console.warn('캐시 데이터 읽기 실패:', error)
    }
    return null
  }

  // 데이터를 캐시에 저장
  const setCachedData = (weather: any, location: LocationData) => {
    try {
      const expiryTime = Date.now() + CACHE_DURATION
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weather))
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location))
      localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString())
    } catch (error) {
      console.warn('캐시 데이터 저장 실패:', error)
    }
  }

  const fetchWeather = async (showLoading = true) => {
    try {
      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true, error: null }))
      }

      // 현재 위치 가져오기
      const location: LocationData = await weatherService.getCurrentLocation()

      // 날씨 정보 가져오기
      const weatherResponse = await weatherService.getCurrentWeather(
        location.latitude,
        location.longitude,
      )

      const weatherData = weatherResponse.current_weather

      // 캐시에 저장
      setCachedData(weatherData, location)

      setState({
        data: weatherData,
        location,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : '날씨 정보를 가져오는데 실패했습니다.',
      }))
    }
  }

  // 주기적 업데이트 (10분마다)
  const startPeriodicUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      fetchWeather(false) // 백그라운드 업데이트 (로딩 표시 안함)
    }, CACHE_DURATION)
  }

  useEffect(() => {
    // 캐시된 데이터가 있는지 확인
    const cachedData = getCachedData()

    if (cachedData) {
      // 캐시된 데이터 사용
      setState({
        data: cachedData.weather,
        location: cachedData.location,
        loading: false,
        error: null,
      })

      // 백그라운드에서 최신 데이터 확인
      fetchWeather(false)
    } else {
      // 캐시된 데이터가 없으면 새로 가져오기
      fetchWeather(true)
    }

    // 주기적 업데이트 시작
    startPeriodicUpdate()

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    ...state,
    refetch: () => fetchWeather(true),
  }
}
