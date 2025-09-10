import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { LoginPage } from '@/features/auth'
import GlobalStyles from '@/styles/GlobalStyles'

export const App = () => {
  return (
    <>
      {/* 전역 스타일 적용 */}
      <GlobalStyles />

      <Router>
        <Routes>
          {/* 기본 경로를 로그인 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 로그인 페이지 라우트 */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </>
  )
}
export default App
