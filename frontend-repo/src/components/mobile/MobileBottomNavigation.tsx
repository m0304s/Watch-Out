import { css } from '@emotion/react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  label: string
  to: string
}

interface MobileBottomNavigationProps {
  items?: NavItem[]
}

const DEFAULT_ITEMS: NavItem[] = [
  { label: '알림', to: '/notification' },
  { label: '현장', to: '/device' },
  { label: '작업자', to: '/worker2' },
  { label: '내 정보', to: '/mypage' },
]

export const MobileBottomNavigation = ({
  items = DEFAULT_ITEMS,
}: MobileBottomNavigationProps) => {
  return (
    <nav css={navStyles}>
      <ul css={navListStyles}>
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
  position: sticky;
  bottom: 0;
  height: 60px;
  background-color: var(--color-bg-white);
  border-top: 1px solid var(--color-gray-300);
`

const navListStyles = css`
  height: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  list-style: none;
  margin: 0;
  padding: 0;
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
  justify-content: center;
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
`
