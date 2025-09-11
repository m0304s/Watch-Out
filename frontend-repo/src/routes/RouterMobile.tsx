import { Routes, Route, Navigate } from 'react-router-dom'
import { MobileLoginPage, MobileSignUpPage } from '@/features/auth'

const RouterMobile = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<MobileLoginPage />} />
      <Route path="/signup" element={<MobileSignUpPage />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  )
}

export default RouterMobile
