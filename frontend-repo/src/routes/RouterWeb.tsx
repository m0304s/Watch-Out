import { Routes, Route, Navigate } from 'react-router-dom'
import LayoutPage from '@/layouts/web/pages/LayoutPage'
import CctvMonitoringPage from '@/features/area/web/pages/CctvMonitoringPage'
import { LoginPage, MobileSignUpPage } from '@/features/auth'
import { SelectedWorkersPage, MobileWorkerListPage } from '@/features/worker'
import { AreaManagementPage, CctvSettingsPage } from '@/features/cctv'
import DashBoard from '@/features/dashboard/web/pages/DashBoard'
import { MobileFaceRegistrationPage } from '@/features/auth'
import { WatchListPage } from '@/features/watch/web/pages/WatchListPage'
import MobileCctvMonitoring from '@/features/area/mobile/MobileCctvMonitoring'
import { SOSPage } from '@/features/sos'

const RouterWeb = () => {
  const isLoggedIn: boolean = true // 개발용

  return (
    <>
      <Routes>
        <Route path="/signup" element={<MobileSignUpPage />} />
        <Route
          path="/face-registration"
          element={<MobileFaceRegistrationPage />}
        />
        <Route path="/worker2" element={<MobileWorkerListPage />} />
        <Route path="/sos" element={<SOSPage />} />
        <Route
          path="/"
          element={
            isLoggedIn ? <LayoutPage /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/cctv/monitoring" element={<CctvMonitoringPage />} />
          <Route path="/worker1" element={<SelectedWorkersPage />} />
          <Route path="/area" element={<AreaManagementPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/cctv/settings" element={<CctvSettingsPage />} />
          <Route path="/watch" element={<WatchListPage />} />
        </Route>
        <Route path="/worker2" element={<MobileWorkerListPage />} />
        <Route path="/cctv2" element={<MobileCctvMonitoring />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default RouterWeb
