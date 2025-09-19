import { css } from '@emotion/react'
import { useAuth, useAuthStore } from '@/stores/authStore'

export const User = () => {
  const { user } = useAuth()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    // 로그아웃 후 로그인 페이지로 리다이렉트
    window.location.href = '/login'
  }

  return (
    <div css={containerStyles}>
      <span css={userNameStyles}>{user.userName}</span>
      <button css={logoutStyles} onClick={handleLogout}>
        로그아웃
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

  &:hover {
    background-color: var(--color-gray-100);
    color: var(--color-gray-800);
  }

  &:active {
    background-color: var(--color-gray-200);
  }
`
