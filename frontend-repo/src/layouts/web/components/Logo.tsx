import { css } from '@emotion/react'

const Logo: React.FC = () => {
  return <div css={logo}>Watch Out</div>
}

export default Logo

const logo = css`
  color: var(--color-primary);
  text-align: center;
  font-family: 'PretendardBold';
  padding: 1rem 0;
  font-size: 1.5rem;
`
