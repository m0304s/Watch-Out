import { Routes, Route, Navigate } from 'react-router-dom'
import LayoutPage from '@/layouts/web/pages/LayoutPage'
import CctvMonitoringPage from '@/features/area/web/pages/CctvMonitoringPage'
import { LoginPage, MobileSignUpPage } from '@/features/auth'
import { SelectedWorkersPage } from '@/features/worker'
import { AreaManagementPage, CctvSettingsPage } from '@/features/cctv'
import DashBoard from '@/features/dashboard/web/pages/DashBoard'
import { WebFCMProvider } from '@/features/notification/components/WebFCMProvider'
import { WatchListPage } from '@/features/watch/web/pages/WatchListPage'
import MobileCctvMonitoring from '@/features/area/mobile/MobileCctvMonitoring'
import { useAuthStore } from '@/stores/authStore'

const RouterWeb = () => {
  // Zustand 스토어에서 인증 상태 확인
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <WebFCMProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<MobileSignUpPage />} />
        <Route
          path="/"
          element={
            isAuthenticated ? <LayoutPage /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/cctv/monitoring" element={<CctvMonitoringPage />} />
          <Route path="/worker" element={<SelectedWorkersPage />} />
          <Route path="/area" element={<AreaManagementPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/cctv/settings" element={<CctvSettingsPage />} />
          <Route path="/watch" element={<WatchListPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="/cctv2" element={<MobileCctvMonitoring />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </WebFCMProvider>
  )
}

export default RouterWeb
