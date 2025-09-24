import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import type { NotificationMessage } from '@/features/notification/types'

interface NotificationModalProps {
  notification: NotificationMessage | null
  isVisible: boolean
  onClose: () => void
}

export const NotificationModal = ({ notification, isVisible, onClose }: NotificationModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 300) // 애니메이션 완료 후 닫기
  }

  if (!isVisible || !notification) {
    return null
  }

  return (
    <div css={overlayStyle}>
      <div css={[modalStyle, isAnimating && animatedModalStyle]}>
        {/* 헤더 */}
        <div css={headerStyle}>
          <div css={titleStyle}>🚨 알림</div>
          <button css={closeButtonStyle} onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* 내용 */}
        <div css={contentStyle}>
          <div css={notificationTitleStyle}>
            {notification.title}
          </div>
          <div css={notificationBodyStyle}>
            {notification.body}
          </div>
          
          {/* 이미지가 있으면 표시 */}
          {notification.imageUrl && (
            <div css={imageContainerStyle}>
              <img 
                src={notification.imageUrl} 
                alt="알림 이미지" 
                css={imageStyle}
              />
            </div>
          )}

          {/* 추가 정보 */}
          {notification.data && (
            <div css={detailsStyle}>
              {notification.data.areaName && (
                <div css={detailItemStyle}>
                  📍 구역: {notification.data.areaName}
                </div>
              )}
              {notification.data.cctvName && (
                <div css={detailItemStyle}>
                  📹 CCTV: {notification.data.cctvName}
                </div>
              )}
              {notification.data.accidentType && (
                <div css={detailItemStyle}>
                  🚨 사고 유형: {notification.data.accidentType}
                </div>
              )}
              {notification.data.reporterName && (
                <div css={detailItemStyle}>
                  👤 신고자: {notification.data.reporterName}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div css={buttonContainerStyle}>
          <button css={confirmButtonStyle} onClick={handleClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

// 스타일 정의
const overlayStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`

const modalStyle = css`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  transform: scale(0.8) translateY(20px);
  opacity: 0;
  transition: all 0.3s ease-out;
`

const animatedModalStyle = css`
  transform: scale(1) translateY(0);
  opacity: 1;
`

const headerStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
`

const titleStyle = css`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`

const closeButtonStyle = css`
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: #f5f5f5;
    color: #666;
  }
`

const contentStyle = css`
  padding: 20px;
  overflow-y: auto;
`

const notificationTitleStyle = css`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
`

const notificationBodyStyle = css`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
`

const imageContainerStyle = css`
  margin: 15px 0;
  text-align: center;
`

const imageStyle = css`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const detailsStyle = css`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 15px;
`

const detailItemStyle = css`
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const buttonContainerStyle = css`
  padding: 0 20px 20px 20px;
  display: flex;
  justify-content: center;
`

const confirmButtonStyle = css`
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #3367d6;
  }
  
  &:active {
    background-color: #2d5aa0;
  }
`
