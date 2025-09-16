import { css } from '@emotion/react'
import { Link } from 'react-router-dom'

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  backTo?: string
  rightSlot?: React.ReactNode
}

export const MobileHeader = ({
  title,
  showBack = false,
  backTo = '/dashboard',
  rightSlot,
}: MobileHeaderProps) => {
  return (
    <header css={headerStyles}>
      <div css={headerInnerStyles}>
        <div css={leftAreaStyles}>
          {showBack ? (
            <Link to={backTo} css={backButtonStyles} aria-label="뒤로가기">
              ←
            </Link>
          ) : (
            <span css={backPlaceholderStyles} />
          )}
        </div>

        <h1 css={titleStyles}>{title}</h1>

        <div css={rightAreaStyles}>{rightSlot}</div>
      </div>
    </header>
  )
}

const headerStyles = css`
  position: sticky;
  top: 0;
  z-index: 10;
  height: 60px;
  background-color: var(--color-primary);
  color: var(--color-text-white);
`

const headerInnerStyles = css`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`

const leftAreaStyles = css`
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

const backButtonStyles = css`
  text-decoration: none;
  color: var(--color-text-white);
  font-family: 'PretendardRegular', sans-serif;
  font-size: 24px;
  line-height: 1;
`

const backPlaceholderStyles = css`
  display: inline-block;
  width: 16px;
`

const titleStyles = css`
  flex: 1;
  text-align: center;
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 18px;
  color: var(--color-text-white);
`

const rightAreaStyles = css`
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--color-text-white);
`
