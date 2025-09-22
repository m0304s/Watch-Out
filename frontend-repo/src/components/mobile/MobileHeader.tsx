import { css } from '@emotion/react'

interface MobileHeaderProps {
  title: string
  rightSlot?: React.ReactNode
}

export const MobileHeader = ({ title, rightSlot }: MobileHeaderProps) => {
  return (
    <header css={headerStyles}>
      <div css={headerInnerStyles}>
        <h1 css={titleStyles}>{title}</h1>
        {rightSlot && <div css={rightAreaStyles}>{rightSlot}</div>}
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
  justify-content: center;
  padding: 0 16px;
  position: relative;
`

const titleStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  font-size: 18px;
  color: var(--color-text-white);
  text-align: center;
`

const rightAreaStyles = css`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: var(--color-text-white);
`
