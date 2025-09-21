import { css } from '@emotion/react'
import { useAuth } from '@/stores/authStore'
import { useLogout } from '@/hooks/useLogout'

export const MobileUser = () => {
  const { user } = useAuth()
  const { handleLogout, isLoggingOut } = useLogout()

  return (
    <div css={containerStyles}>
      <span css={userNameStyles}>{user.userName}</span>
      <button css={logoutStyles} onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? '...' : '로그아웃'}
      </button>
    </div>
  )
}

const containerStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

const userNameStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  color: var(--color-text-white);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`

const logoutStyles = css`
  font-family: 'PretendardRegular', sans-serif;
  color: var(--color-text-white);
  font-size: 12px;
  font-weight: 400;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0.8;

  &:hover:not(:disabled) {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
