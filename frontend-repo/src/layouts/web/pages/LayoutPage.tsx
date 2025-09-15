import { css } from '@emotion/react'
import { Outlet } from 'react-router-dom'
import { useLayoutStore } from '@/stores/layoutStore'
import Logo from '@/layouts/web/components/Logo'
import DateTime from '@/layouts/web/components/DateTime'
import User from '@/layouts/web/components/User'
import Navigation from '@/layouts/web/components/Navigation'
import Header from '@/layouts/web/components/Header'
import NotificationPage from '@/notification/web/pages/NotificationPage'

const Layout: React.FC = () => {
  const { isNavOpen } = useLayoutStore()
  return (
    <>
      <div css={layoutContainer}>
        <aside css={sideContainer(isNavOpen)}>
          {isNavOpen && (
            <div>
              <div>
                <Logo />
                <DateTime />
                <User />
              </div>
              <Navigation />
            </div>
          )}
        </aside>
        <div css={contentConatiner}>
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
        <aside css={notiContainer}>
          <NotificationPage />
        </aside>
      </div>
    </>
  )
}
export default Layout

const layoutContainer = css`
  display: flex;
`

const sideContainer = (isNavOpen: boolean) => css`
  width: ${isNavOpen ? '15%' : '0'};
  height: 100vh;
  border-right: 1px solid var(--color-gray-400);
  box-shadow: 10px 0 25px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;

  transition: width 0.4s ease;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;
`
const contentConatiner = css`
  flex-grow: 1;
`

const notiContainer = css`
  width: 18%;
  border-left: 1px solid var(--color-gray-400);
`
