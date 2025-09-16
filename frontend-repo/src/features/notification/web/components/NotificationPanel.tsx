import { css } from '@emotion/react'
import { useFCM } from '../../hooks/useFCM'
import NotificationItem from '../../components/NotificationItem'

const NotificationPanel = () => {
  const {
    token,
    isRegistered,
    isLoading,
    error,
    notifications,
    registerToken,
    removeToken,
    clearNotifications
  } = useFCM()

  return (
    <div css={container}>
      <div css={header}>
        <h3>알림</h3>
        <div css={buttonGroup}>
          {!isRegistered ? (
            <button
              onClick={registerToken}
              disabled={isLoading}
              css={buttonStyle}
            >
              {isLoading ? '등록 중...' : '알림 활성화'}
            </button>
          ) : (
            <button
              onClick={removeToken}
              disabled={isLoading}
              css={buttonStyle}
            >
              {isLoading ? '삭제 중...' : '알림 비활성화'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div css={errorStyle}>
          {error}
        </div>
      )}

      {isRegistered && (
        <div css={statusStyle}>
          ✅ 알림이 활성화되었습니다
        </div>
      )}

      <div css={notificationsContainer}>
        {notifications.length > 0 && (
          <div css={clearButtonContainer}>
            <button onClick={clearNotifications} css={clearButton}>
              모두 지우기
            </button>
          </div>
        )}
        
        {notifications.map((notification, index) => (
          <NotificationItem
            key={index}
            notification={notification}
            timestamp={new Date().toLocaleTimeString()}
          />
        ))}

        {notifications.length === 0 && (
          <div css={emptyState}>
            {isRegistered ? '새로운 알림이 없습니다' : '알림을 활성화해주세요'}
          </div>
        )}
      </div>
    </div>
  )
}

const container = css`
  height: 100vh;
  padding: 16px;
  background-color: var(--color-bg-white);
  overflow-y: auto;
`

const header = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-gray-200);
`

const buttonGroup = css`
  display: flex;
  gap: 8px;
`

const buttonStyle = css`
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: var(--color-text-white);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const errorStyle = css`
  padding: 12px;
  background-color: #fee;
  color: var(--color-red);
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`

const statusStyle = css`
  padding: 12px;
  background-color: #efe;
  color: var(--color-green);
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`

const notificationsContainer = css`
  flex: 1;
`

const clearButtonContainer = css`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`

const clearButton = css`
  padding: 4px 8px;
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-gray-300);
  }
`

const emptyState = css`
  text-align: center;
  color: var(--color-gray-500);
  font-size: 14px;
  padding: 40px 20px;
`

export default NotificationPanel
