import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { SelectedWorkersPage } from '@/features/worker'

const RouterWeb = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Worker Management Routes */}
      <Route path="/worker" element={<SelectedWorkersPage />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default RouterWeb
