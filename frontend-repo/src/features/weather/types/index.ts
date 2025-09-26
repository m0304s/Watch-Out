export interface WeatherData {
  temperature: number
  windspeed: number
  weathercode: number
  time: string
}

export interface WeatherResponse {
  current_weather: WeatherData
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
}

export interface LocationData {
  latitude: number
  longitude: number
}

export interface WeatherState {
  data: WeatherData | null
  location: LocationData | null
  loading: boolean
  error: string | null
}
