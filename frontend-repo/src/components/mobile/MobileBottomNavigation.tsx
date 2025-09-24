import { css } from '@emotion/react'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useUserRole } from '@/stores/authStore'

interface NavItem {
  label: string
  to: string
}

interface MobileBottomNavigationProps {
  items?: NavItem[]
}

const getNavListStyles = (count: number) => css`
  height: 100%;
  display: grid;
  grid-template-columns: repeat(${count}, 1fr);
  list-style: none;
  margin: 0;
  padding: 0;
`

export const MobileBottomNavigation = ({
  items: itemsProp,
}: MobileBottomNavigationProps) => {
  const userRole = useUserRole()

  const roleItems: NavItem[] = useMemo(() => {
    if (userRole === 'ADMIN' || userRole === 'AREA_ADMIN') {
      return [
        { label: 'SOS', to: '/sos' },
        { label: '알림', to: '/notification' },
        { label: '현장', to: '/cctv2' },
        { label: '작업자', to: '/worker2' },
      ]
    }
    if (userRole === 'WORKER') {
      return [
        { label: 'SOS', to: '/sos' },
        { label: '알림', to: '/notification' },
      ]
    }
    return []
  }, [userRole])

  const items = itemsProp ?? roleItems

  if (!items.length) return null

  return (
    <nav css={navStyles}>
      <ul css={getNavListStyles(items.length)}>
        {items.map((item) => (
          <li key={item.to} css={navItemStyles}>
            <NavLink to={item.to} css={linkStyles} end>
              {({ isActive }) => (
                <span
                  css={[innerContainerStyles, isActive && activeColorStyles]}
                >
                  <span css={labelStyles}>{item.label}</span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const navStyles = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(60px + env(safe-area-inset-bottom));
  background-color: var(--color-bg-white);
  border-top: 1px solid var(--color-gray-300);
  z-index: 100;
`

const navItemStyles = css`
  display: flex;
`

const linkStyles = css`
  flex: 1;
  text-decoration: none;
  color: inherit;
`

const innerContainerStyles = css`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--color-gray-500);
  font-family: 'PretendardRegular', sans-serif;
  font-size: 10px;
`

const activeColorStyles = css`
  color: var(--color-primary);
`

const labelStyles = css`
  line-height: 1;
  padding-top: 2rem;
`
