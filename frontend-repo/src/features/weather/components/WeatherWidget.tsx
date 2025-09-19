import React from 'react'
import { css } from '@emotion/react'
import { useWeatherOptimized } from '@/features/weather/hooks/useWeatherOptimized'

export const WeatherWidget = () => {
  const { data, loading, error, refetch } = useWeatherOptimized()

  const getWeatherIcon = (weatherCode: number) => {
    // WMO Weather interpretation codes (WW)
    if (weatherCode === 0) return '☀️' // Clear sky
    if (weatherCode <= 3) return '⛅' // Partly cloudy
    if (weatherCode <= 48) return '☁️' // Overcast
    if (weatherCode <= 67) return '🌧️' // Rain
    if (weatherCode <= 77) return '❄️' // Snow
    if (weatherCode <= 82) return '🌧️' // Rain showers
    if (weatherCode <= 86) return '❄️' // Snow showers
    if (weatherCode <= 99) return '⛈️' // Thunderstorm
    return '🌤️' // Default
  }

  const getWeatherDescription = (weatherCode: number) => {
    if (weatherCode === 0) return '맑음'
    if (weatherCode <= 3) return '부분적으로 흐림'
    if (weatherCode <= 48) return '흐림'
    if (weatherCode <= 67) return '비'
    if (weatherCode <= 77) return '눈'
    if (weatherCode <= 82) return '소나기'
    if (weatherCode <= 86) return '눈 소나기'
    if (weatherCode <= 99) return '뇌우'
    return '날씨 정보 없음'
  }

  if (loading) {
    return (
      <div css={container}>
        <div css={loadingContainer}>
          <span css={loadingText}>날씨 로딩 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div css={container}>
        <div css={errorContainer}>
          <span css={errorText}>날씨 정보 없음</span>
          <button css={retryButton} onClick={refetch}>
            🔄
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div css={container}>
        <div css={errorContainer}>
          <span css={errorText}>날씨 정보 없음</span>
        </div>
      </div>
    )
  }

  return (
    <div css={container}>
      <div css={weatherContainer}>
        <div css={weatherIcon}>{getWeatherIcon(data.weathercode)}</div>
        <div css={weatherInfo}>
          <div css={temperature}>{Math.round(data.temperature)}°C</div>
          <div css={description}>{getWeatherDescription(data.weathercode)}</div>
        </div>
      </div>
    </div>
  )
}

const container = css`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
`

const loadingContainer = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

const loadingText = css`
  font-family: 'PretendardRegular', sans-serif;
  font-size: 14px;
  color: var(--color-gray-600);
`

const errorContainer = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

const errorText = css`
  font-family: 'PretendardRegular', sans-serif;
  font-size: 14px;
  color: var(--color-gray-500);
`

const retryButton = css`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--color-gray-100);
  }
`

const weatherContainer = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
`

const weatherIcon = css`
  font-size: 24px;
  line-height: 1;
`

const weatherInfo = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const temperature = css`
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 16px;
  color: var(--color-gray-900);
  line-height: 1.2;
`

const description = css`
  font-family: 'PretendardRegular', sans-serif;
  font-size: 12px;
  color: var(--color-gray-600);
  line-height: 1.2;
`

const windInfo = css`
  display: flex;
  align-items: center;
`

const windText = css`
  font-family: 'PretendardRegular', sans-serif;
  font-size: 12px;
  color: var(--color-gray-600);
`
