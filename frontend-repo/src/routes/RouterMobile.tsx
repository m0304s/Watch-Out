import { Routes, Route, Navigate } from 'react-router-dom'
import {
  MobileLoginPage,
  MobileSignUpPage,
  MobileFaceRegistrationPage,
} from '@/features/auth'
import { MobileWorkerListPage } from '@/features/worker'
import MobileCctvMonitoring from '@/features/area/mobile/MobileCctvMonitoring'
import { SOSPage } from '@/features/sos'
import Notification from '@/notification/web/pages/NotificationPage'

const RouterMobile = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<MobileLoginPage />} />
      <Route path="/signup" element={<MobileSignUpPage />} />
      <Route
        path="/face-registration"
        element={<MobileFaceRegistrationPage />}
      />

      {/* Mobile Routes */}
      <Route path="/sos" element={<SOSPage />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="/cctv/monitoring" element={<MobileCctvMonitoring />} />
      <Route path="/worker" element={<MobileWorkerListPage />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  )
}

export default RouterMobile
