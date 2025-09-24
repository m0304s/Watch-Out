import { Routes, Route, Navigate } from 'react-router-dom'
import {
  MobileLoginPage,
  MobileSignUpPage,
  MobileFaceRegistrationPage,
} from '@/features/auth'
import { MobileWorkerListPage } from '@/features/worker'
import { MobileFCMProvider } from '@/features/notification/components/MobileFCMProvider'
import { MobileNotificationPage } from '@/features/notification/mobile/pages/MobileNotificationPage'
import MobileCctvMonitoring from '@/features/area/mobile/MobileCctvMonitoring'
import { SOSPage } from '@/features/sos'
import { useAuthStore } from '@/stores/authStore'

const RouterMobile = () => {
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated)
  
  console.log('📱 RouterMobile - 인증 상태:', isLoggedIn)
  console.log('📱 RouterMobile - 현재 경로:', window.location.pathname)

  return (
    <MobileFCMProvider>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<MobileLoginPage />} />
        <Route path="/login" element={<MobileLoginPage />} />
        <Route path="/signup" element={<MobileSignUpPage />} />
        <Route
          path="/face-registration"
          element={<MobileFaceRegistrationPage />}
        />

        {/* Protected Mobile Routes */}
        <Route 
          path="/sos" 
          element={isLoggedIn ? <SOSPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/notification" 
          element={isLoggedIn ? <MobileNotificationPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/cctv/monitoring" 
          element={isLoggedIn ? <MobileCctvMonitoring /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/cctv2" 
          element={isLoggedIn ? <MobileCctvMonitoring /> : <Navigate to="/login" replace />} 
        />
        
        {/* Worker Routes */}
        <Route 
          path="/worker" 
          element={isLoggedIn ? <MobileWorkerListPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/worker2" 
          element={isLoggedIn ? <MobileWorkerListPage /> : <Navigate to="/login" replace />} 
        />

        {/* Notification Routes */}
        <Route 
          path="/notifications" 
          element={isLoggedIn ? <MobileNotificationPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/alarms" 
          element={isLoggedIn ? <MobileNotificationPage /> : <Navigate to="/login" replace />} 
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MobileFCMProvider>
  )
}

export default RouterMobile
