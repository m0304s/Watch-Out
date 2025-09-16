import { css } from '@emotion/react'
import type { NotificationMessage } from '../types'

interface NotificationItemProps {
  notification: NotificationMessage
  timestamp: string
}

const NotificationItem = ({ notification, timestamp }: NotificationItemProps) => {
  return (
    <div css={notificationItem}>
      <div css={notificationHeader}>
        <h4>{notification.title}</h4>
        <span css={timestampStyle}>{timestamp}</span>
      </div>
      <p css={notificationBody}>{notification.body}</p>
      {notification.data?.areaName && (
        <div css={notificationData}>
          <span>구역: {notification.data.areaName}</span>
          {notification.data.cctvName && (
            <span>CCTV: {notification.data.cctvName}</span>
          )}
          {notification.data.violationTypes && (
            <span>위반: {notification.data.violationTypes}</span>
          )}
        </div>
      )}
    </div>
  )
}

const notificationItem = css`
  padding: 12px;
  margin-bottom: 8px;
  background-color: var(--color-gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
`

const notificationHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const notificationBody = css`
  margin: 0 0 8px 0;
  color: var(--color-gray-700);
  font-size: 14px;
  line-height: 1.4;
`

const notificationData = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--color-gray-600);
`

const timestampStyle = css`
  font-size: 12px;
  color: var(--color-gray-500);
`

export default NotificationItem
