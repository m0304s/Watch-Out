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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  height: 60px;
  background-color: var(--color-primary);
  color: var(--color-text-white);

  /* 갤럭시 기기에서의 최적화 */
  padding-top: env(safe-area-inset-top, 0px);

  /* 헤더 그림자 효과로 고정감 강화 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
