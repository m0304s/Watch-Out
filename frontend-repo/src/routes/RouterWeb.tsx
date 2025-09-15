import { Routes, Route, Navigate } from 'react-router-dom'
import LayoutPage from '@/layouts/web/pages/LayoutPage'
import { LoginPage } from '@/features/auth'
import { SelectedWorkersPage } from '@/features/worker'

const RouterWeb = () => {
  const isLoggedIn: boolean = true // 개발용

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <LayoutPage /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/worker" element={<SelectedWorkersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default RouterWeb
