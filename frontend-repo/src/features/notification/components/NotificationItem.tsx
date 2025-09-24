import { css } from '@emotion/react'
import type { NotificationMessage } from '@/features/notification/types'

interface NotificationItemProps {
  notification: NotificationMessage
  onClick?: () => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  // 알림 수신 시간을 포맷팅
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMinutes < 1) {
        return '방금 전'
      } else if (diffMinutes < 60) {
        return `${diffMinutes}분 전`
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`
      } else if (diffDays < 7) {
        return `${diffDays}일 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } catch (error) {
      console.error('타임스탬프 포맷팅 오류:', error)
      return '시간 정보 없음'
    }
  }

  const displayTime = formatTimestamp(notification.timestamp)
  const isSafetyEquipmentAlert = notification.title?.includes('안전장비') || 
                                 notification.title?.includes('미착용') ||
                                 notification.body?.includes('안전장비') ||
                                 notification.body?.includes('미착용') ||
                                 notification.data?.type === 'SAFETY_VIOLATION'

  const isHeavyEquipmentAlert = notification.title?.includes('중장비') || 
                                notification.title?.includes('진입') ||
                                notification.body?.includes('중장비') ||
                                notification.body?.includes('진입') ||
                                notification.data?.type === 'HEAVY_EQUIPMENT'

  const isAccidentReport = notification.data?.type === 'ACCIDENT_REPORT' ||
                           notification.title?.includes('사고 신고') ||
                           notification.title?.includes('사고 접수')

  const isClickable = (isSafetyEquipmentAlert && notification.data?.violationUuid) || 
                     (isHeavyEquipmentAlert && notification.data?.imageUrl)

  return (
    <div 
      css={[
        notificationItemWithHover, 
        isClickable && clickableItem,
        isAccidentReport && accidentReportItem,
        isSafetyEquipmentAlert && safetyEquipmentItem,
        isHeavyEquipmentAlert && heavyEquipmentItem
      ]}
      onClick={isClickable ? onClick : undefined}
    >
      <div css={
        isAccidentReport ? accidentReportDot :
        isSafetyEquipmentAlert ? safetyEquipmentDot : 
        isHeavyEquipmentAlert ? heavyEquipmentDot : 
        notificationDot
      }></div>
      <div css={notificationContent}>
        <div css={notificationTitleText}>{notification.title}</div>
        <div css={notificationDescription}>{notification.body}</div>
        <div css={notificationMeta}>
          {displayTime}
          {isClickable && <span css={clickHint}>클릭하여 상세보기</span>}
        </div>
      </div>
    </div>
  )
}


const notificationItemWithHover = css`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--color-bg-white);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  min-width: 0;
  position: relative;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`

const notificationDot = css`
  width: 12px;
  height: 12px;
  background: var(--color-green);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
`

const safetyEquipmentItem = css`
  background: #fef3c7 !important;
  border: 2px solid #fde68a;
  border-left: 4px solid var(--color-yellow);
  
  &:hover {
    background: #fde68a !important;
    border-color: #f59e0b;
    box-shadow: 0 4px 12px rgba(241, 196, 15, 0.15);
  }
`

const safetyEquipmentDot = css`
  width: 12px;
  height: 12px;
  background: var(--color-yellow);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px #fde68a;
`

const heavyEquipmentItem = css`
  background: #fef2f2 !important;
  border: 2px solid #fecaca;
  border-left: 4px solid #f97316;
  
  &:hover {
    background: #fed7aa !important;
    border-color: #fb923c;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
  }
`

const heavyEquipmentDot = css`
  width: 12px;
  height: 12px;
  background: #f97316;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px #fed7aa;
`

const notificationContent = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
`

const notificationTitleText = css`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-gray-800);
  line-height: 1.4;
  margin: 0;
`

const notificationDescription = css`
  font-size: 14px;
  color: var(--color-gray-600);
  line-height: 1.5;
  margin: 0;
`

const notificationMeta = css`
  font-size: 12px;
  color: var(--color-gray-500);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`

const clickableItem = css`
  cursor: pointer;
  
  &:hover {
    background: var(--color-gray-50);
    border: 1px solid var(--color-gray-200);
  }
`

const clickHint = css`
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 500;
  background: var(--color-primary-light);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--color-secondary);
`

const accidentReportItem = css`
  background: #fef2f2 !important;
  border: 2px solid #fecaca;
  border-left: 4px solid var(--color-red);
  
  &:hover {
    background: #fee2e2 !important;
    border-color: #fca5a5;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
  }
`

const accidentReportDot = css`
  width: 12px;
  height: 12px;
  background: var(--color-red);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px #fecaca;
`


export default NotificationItem
