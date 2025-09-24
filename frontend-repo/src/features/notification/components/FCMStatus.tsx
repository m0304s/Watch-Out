import { css } from '@emotion/react'
import { useFCM } from '@/features/notification/hooks/useFCM'
import { useAuthStore } from '@/stores/authStore'

interface FCMStatusProps {
  showToken?: boolean
}

export const FCMStatus: React.FC<FCMStatusProps> = ({ showToken = false }) => {
  const { isRegistered, token } = useFCM()
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div css={statusContainer}>
      <div css={statusItem}>
        <span css={statusLabel}>FCM 상태:</span>
        <span css={isRegistered ? statusSuccess : statusError}>
          {isRegistered ? '✅ 활성화' : '❌ 비활성화'}
        </span>
      </div>
      
      {showToken && token && (
        <div css={tokenContainer}>
          <span css={statusLabel}>FCM 토큰:</span>
          <code css={tokenCode}>{token.substring(0, 50)}...</code>
        </div>
      )}
    </div>
  )
}

const statusContainer = css`
  padding: 12px 16px;
  background-color: var(--color-gray-50);
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
`

const statusItem = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const statusLabel = css`
  font-weight: 500;
  color: var(--color-gray-700);
`

const statusSuccess = css`
  color: var(--color-green);
  font-weight: 600;
`

const statusError = css`
  color: var(--color-red);
  font-weight: 600;
`

const tokenContainer = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const tokenCode = css`
  padding: 8px;
  background-color: var(--color-gray-100);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  color: var(--color-gray-600);
`
