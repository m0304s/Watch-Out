import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import GlobalStyles from '@/styles/GlobalStyles'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <GlobalStyles />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
