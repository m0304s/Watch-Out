import { Routes, Route, Navigate } from 'react-router-dom'
import {
  MobileLoginPage,
  MobileSignUpPage,
  MobileFaceRegistrationPage,
} from '@/features/auth'
import { MobileWorkerListPage } from '@/features/worker'

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

      {/* Worker Routes */}
      <Route path="/worker" element={<MobileWorkerListPage />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  )
}

export default RouterMobile
