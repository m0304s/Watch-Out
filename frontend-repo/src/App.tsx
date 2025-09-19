import { useEffect } from 'react'
import { isMobilePlatform } from '@/utils/platform'
import RouterMobile from '@/routes/RouterMobile'
import RouterWeb from '@/routes/RouterWeb'
import { initializeWeatherStore } from '@/stores/weatherStore'

const App = () => {
  const isMobile = isMobilePlatform()

  useEffect(() => {
    // 앱 시작 시 날씨 스토어 초기화
    initializeWeatherStore()
  }, [])

  return <div>{isMobile ? <RouterMobile /> : <RouterWeb />}</div>
}
export default App





