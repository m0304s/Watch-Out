import { Routes, Route, Navigate } from 'react-router-dom'
import LayoutPage from '@/layouts/web/pages/LayoutPage'
import { LoginPage, MobileSignUpPage } from '@/features/auth'
import { SelectedWorkersPage, MobileWorkerListPage } from '@/features/worker'
import { AreaManagementPage } from '@/features/cctv'

const RouterWeb = () => {
  // localStorage에서 토큰 확인
  const isLoggedIn = !!localStorage.getItem('accessToken')

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<MobileSignUpPage />} />
        <Route
          path="/"
          element={
            isLoggedIn ? <LayoutPage /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/worker1" element={<SelectedWorkersPage />} />
          <Route path="/area" element={<AreaManagementPage />} />
          <Route path="/dashboard" element={<div>대시보드</div>} />
        </Route>
        <Route path="/worker2" element={<MobileWorkerListPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default RouterWeb
