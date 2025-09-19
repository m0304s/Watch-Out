import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { useLocation } from 'react-router-dom'
import { GoSidebarCollapse } from 'react-icons/go'
import { GoSidebarExpand } from 'react-icons/go'
import type { NavItem } from '@/constants/navigationWeb'
import { NAV_ITEMS } from '@/constants/navigationWeb'
import { useLayoutStore } from '@/stores/layoutStore'
import { WeatherWidget } from '@/features/weather'

const Header: React.FC = () => {
  const location = useLocation()
  const { isNavOpen, toggleNav } = useLayoutStore()
  const [currentPage, setCurrentPage] = useState<string>('')

  useEffect(() => {
    // 내비게이션 목록
    const allNavLinks = NAV_ITEMS.reduce<NavItem[]>((acc, item) => {
      acc.push(item)
      if (item.children) {
        acc.push(...item.children)
      }
      return acc
    }, [])

    const currentNavItem = allNavLinks.find(
      (item) => item.path === location.pathname,
    )

    if (currentNavItem) {
      setCurrentPage(currentNavItem.name)
    } else {
      setCurrentPage('')
    }
  }, [location])

  return (
    <div css={container}>
      <div css={leftBox}>
        <button onClick={toggleNav} css={toggleButton}>
          {isNavOpen ? <GoSidebarExpand /> : <GoSidebarCollapse />}
        </button>
        <p css={headerText}>{currentPage}</p>
      </div>
      <div css={weatherBox}>
        <WeatherWidget />
      </div>
    </div>
  )
}

export default Header

const container = css`
  flex-grow: 1;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  display: flex;
  border-bottom: 1px solid var(--color-gray-400);
`

const leftBox = css`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding: 0 2rem;
`

const toggleButton = css`
  border: none;
  outline: none;
  background-color: inherit;
  cursor: pointer;
  padding-top: 2px;
`

const headerText = css`
  padding: 0 1rem;
  font-weight: 600;
  font-size: 18px;
`

const weatherBox = css`
  padding: 0 2rem;
  display: flex;
  align-items: center;
`
