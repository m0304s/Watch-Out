import { css } from '@emotion/react'

export const MobileAppHeader = () => {
  return (
    <div css={containerStyles}>
      <h1 css={titleStyles}>Watch Out</h1>
      <p css={subtitleStyles}>우리의 현장을 안전하게</p>
    </div>
  )
}

const containerStyles = css`
  text-align: center;
  margin-bottom: 32px;
`

const titleStyles = css`
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: 10px;
  font-family: 'PretendardBold', sans-serif;
`

const subtitleStyles = css`
  font-size: 16px;
  color: var(--color-gray-600);
  font-family: 'PretendardRegular', sans-serif;
`


