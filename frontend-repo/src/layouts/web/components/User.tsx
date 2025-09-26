import { css } from '@emotion/react'
import { useAuth } from '@/stores/authStore'
import { useLogout } from '@/hooks/useLogout'

export const User = () => {
  const { user } = useAuth()
  const { handleLogout, isLoggingOut } = useLogout()

  return (
    <div css={containerStyles}>
      <span css={userNameStyles}>{user.userName}</span>
      <button css={logoutStyles} onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  )
}

const containerStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 4px;
`

const userNameStyles = css`
  font-family: 'PretendardSemiBold', sans-serif;
  color: var(--color-gray-900);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`

const logoutStyles = css`
  font-family: 'PretendardRegular', sans-serif;
  color: var(--color-gray-600);
  font-size: 12px;
  font-weight: 400;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-gray-100);
    color: var(--color-gray-800);
  }

  &:active:not(:disabled) {
    background-color: var(--color-gray-200);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
