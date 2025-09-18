import { css } from '@emotion/react'
import { IoIosArrowForward } from 'react-icons/io'
import { IoIosArrowDown } from 'react-icons/io'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/constants/navigationWeb'

const Navigation = () => {
  const [openNavArea, setOpenNavArea] = useState<boolean>(false)
  const handleNavAreaClick = () => {
    setOpenNavArea((prev) => !prev)
  }

  return (
    <nav css={container}>
      {NAV_ITEMS.map((item) => (
        <li key={item.id}>
          {item.children ? (
            <div>
              <button css={navButton} onClick={() => handleNavAreaClick()}>
                {openNavArea ? <IoIosArrowDown /> : <IoIosArrowForward />}
                {item.icon && <item.icon />}
                <div css={toggleItem}> {item.name}</div>
              </button>
              {openNavArea && (
                <div css={subMenu}>
                  {item.children.map((child) => (
                    <NavLink to={child.path} css={commonItem}>
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink to={item.path} css={commonItem}>
              <div css={iconSpacer}></div>
              {item.icon && <item.icon />}
              {item.name}
            </NavLink>
          )}
        </li>
      ))}
    </nav>
  )
}

export default Navigation

const container = css`
  width: 100%;
  padding: 1rem 0;
  font-family: 'Pretendard', sans-serif;
  border-right: 1px solid #e5e7eb;

  ul {
    padding: 0;
    margin: 0;
  }

  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`

const commonItem = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1rem;
  margin: 0.3rem 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  color: #111827;
  text-decoration: none;

  svg {
    font-size: 18px;
    color: #111827;
    flex-shrink: 0;
  }

  span {
    flex-grow: 1;
  }

  &:hover {
    background-color: var(--color-gray-200);
  }

  &.active {
    background-color: var(--color-gray-200);
  }
`

const navButton = css`
  ${commonItem};
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  font-family: inherit;

  &.active {
    background-color: transparent;
    font-weight: normal;
  }
`

const toggleItem = css`
  padding: 0.25rem 0;
`
const subMenu = css`
  display: flex;
  flex-direction: column;
  margin-left: 24px;
  padding-left: 27px;
`

const iconSpacer = css`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`
