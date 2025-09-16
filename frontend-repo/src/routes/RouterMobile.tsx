import { Routes, Route, Navigate } from 'react-router-dom'
import { MobileLoginPage, MobileSignUpPage } from '@/features/auth'
import { MobileWorkerListPage } from '@/features/worker'

const RouterMobile = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<MobileLoginPage />} />
      <Route path="/signup" element={<MobileSignUpPage />} />
      
      {/* Worker Routes */}
      <Route path="/worker" element={<MobileWorkerListPage />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/worker" replace />} />
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  )
}

export default RouterMobile
