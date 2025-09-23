import { Global } from '@emotion/react'
import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import App from '@/App'
import GlobalStyles from '@/styles/GlobalStyles'
import { toastStyles } from '@/styles/ToastStyles'
import AuthWatchSyncGate from '@/bootstrap/AuthWatchSyncGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalStyles />
      <Global styles={toastStyles} />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        pauseOnFocusLoss={false}
      />
      <AuthWatchSyncGate />
      <App />
    </BrowserRouter>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((rs) => rs.forEach((r) => r.unregister()))
}
