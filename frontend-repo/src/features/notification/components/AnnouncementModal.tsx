import React from 'react'
import { css } from '@emotion/react'

// 색상 조정 유틸리티 함수
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

interface AnnouncementModalProps {
  isVisible: boolean
  title: string
  content: string
  sender?: string
  timestamp?: string
  onClose: () => void
  color?: string
  icon?: string
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isVisible,
  title,
  content,
  sender,
  timestamp,
  onClose,
  color = '#4caf50',
  icon = '📢'
}) => {
  if (!isVisible) return null

  return (
    <div css={overlayStyle} onClick={onClose}>
      <div css={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div css={[headerStyle, css`background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)});`]}>
          <div css={iconContainerStyle}>
            <div css={announcementIconStyle}>{icon}</div>
          </div>
          <h2 css={titleStyle}>{title}</h2>
          <button css={closeButtonStyle} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 내용 */}
        <div css={contentStyle}>
          <div css={[messageStyle, css`border-left-color: ${color};`]}>
            {content}
          </div>

          {/* 메타 정보 */}
          <div css={metaStyle}>
            {sender && (
              <div css={metaItemStyle}>
                <span css={metaLabelStyle}>👤 발송자</span>
                <span css={metaValueStyle}>{sender}</span>
              </div>
            )}
            
            {timestamp && (
              <div css={metaItemStyle}>
                <span css={metaLabelStyle}>🕐 발송 시간</span>
                <span css={metaValueStyle}>
                  {new Date(timestamp).toLocaleString('ko-KR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div css={actionsStyle}>
          <button css={[primaryButtonStyle, css`background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)});`]} onClick={onClose}>
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`

const modalStyle = css`
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`

const headerStyle = css`
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  padding: 1.5rem;
  position: relative;
  text-align: center;
`

const iconContainerStyle = css`
  margin-bottom: 0.5rem;
`

const announcementIconStyle = css`
  font-size: 2rem;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(-4px);
    }
  }
`

const titleStyle = css`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`

const closeButtonStyle = css`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const contentStyle = css`
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
`

const messageStyle = css`
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4caf50;
  font-size: 1rem;
  line-height: 1.6;
  color: #2c3e50;
  white-space: pre-wrap;
`

const metaStyle = css`
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
`

const metaItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
`

const metaLabelStyle = css`
  font-weight: 500;
  color: #6c757d;
  font-size: 0.9rem;
`

const metaValueStyle = css`
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
`

const actionsStyle = css`
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
`

const primaryButtonStyle = css`
  width: 100%;
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`

export default AnnouncementModal
