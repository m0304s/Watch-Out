import { Routes, Route, Navigate } from 'react-router-dom'
import { MobileLoginPage } from '@/features/auth'

const RouterMobile = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<MobileLoginPage />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default RouterMobile
