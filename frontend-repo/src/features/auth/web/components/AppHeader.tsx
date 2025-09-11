import { css } from '@emotion/react'

export const AppHeader = () => {
  return (
    <div
      css={css`
        text-align: center;
        margin-bottom: 60px;
      `}
    >
      <h1
        css={css`
          font-size: 48px;
          color: var(--color-primary);
          margin-bottom: 18px;
        `}
      >
        Watch Out
      </h1>
      <p
        css={css`
          font-size: 24px;
          color: var(--color-gray-500);
        `}
      >
        우리의 현장을 안전하게
      </p>
    </div>
  )
}
