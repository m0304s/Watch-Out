import { useEffect } from 'react';
import { isMobilePlatform } from '@/utils/platform';
import RouterMobile from '@/routes/RouterMobile';
import RouterWeb from '@/routes/RouterWeb';
import { initializeWeatherStore } from '@/stores/weatherStore';

const App = () => {
  const isMobile = isMobilePlatform();

  useEffect(() => {
    initializeWeatherStore();

    // 웹에서 브라우저 알림 권한 요청
    if (!isMobile && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        console.log('🔔 웹 앱 시작 시 브라우저 알림 권한 요청...')
        Notification.requestPermission().then((permission) => {
          console.log('🔔 브라우저 알림 권한 결과:', permission)
        })
      }
    }
  }, [isMobile]);

  return <div>{isMobile ? <RouterMobile /> : <RouterWeb />}</div>;
};

export default App;





