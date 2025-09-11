import { isMobilePlatform } from '@/utils/platform'
import RouterMobile from '@/routes/RouterMobile'
import RouterWeb from '@/routes/RouterWeb'

const App = () => {
  const isMobile = isMobilePlatform()
  return <div>{isMobile ? <RouterMobile /> : <RouterWeb />}</div>
}
export default App
