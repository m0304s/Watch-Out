import React from 'react'
import { css } from '@emotion/react'

interface AccidentReportData {
  areaName?: string
  accidentType?: string
  reporterName?: string
  companyName?: string
  timestamp?: string
}

interface AccidentReportModalProps {
  isVisible: boolean
  title: string
  body: string
  data: AccidentReportData
  onClose: () => void
}

const AccidentReportModal: React.FC<AccidentReportModalProps> = ({
  isVisible,
  title,
  body,
  data,
  onClose
}) => {
  if (!isVisible) return null

  return (
    <div css={overlayStyle} onClick={onClose}>
      <div css={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div css={headerStyle}>
          <div css={iconContainerStyle}>
            <div css={emergencyIconStyle}>🚨</div>
          </div>
          <h2 css={titleStyle}>{title}</h2>
          <button css={closeButtonStyle} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 내용 */}
        <div css={contentStyle}>
          <div css={messageStyle}>
            {body}
          </div>

          {/* 상세 정보 */}
          <div css={detailsStyle}>
            <h3 css={detailsTitleStyle}>상세 정보</h3>
            
            <div css={detailItemStyle}>
              <span css={labelStyle}>🏢 구역</span>
              <span css={valueStyle}>{data.areaName || '미상'}</span>
            </div>

            <div css={detailItemStyle}>
              <span css={labelStyle}>⚠️ 신고 유형</span>
              <span css={valueStyle}>{data.accidentType || '미상'}</span>
            </div>

            <div css={detailItemStyle}>
              <span css={labelStyle}>👤 신고자</span>
              <span css={valueStyle}>{data.reporterName || '미상'}</span>
            </div>

            <div css={detailItemStyle}>
              <span css={labelStyle}>🏭 회사명</span>
              <span css={valueStyle}>{data.companyName || '미상'}</span>
            </div>

            {data.timestamp && (
              <div css={detailItemStyle}>
                <span css={labelStyle}>🕐 신고 시간</span>
                <span css={valueStyle}>
                  {new Date(data.timestamp).toLocaleString('ko-KR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div css={actionsStyle}>
          <button css={primaryButtonStyle} onClick={onClose}>
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
  background: linear-gradient(135deg, #ff4757, #ff3742);
  color: white;
  padding: 1.5rem;
  position: relative;
  text-align: center;
`

const iconContainerStyle = css`
  margin-bottom: 0.5rem;
`

const emergencyIconStyle = css`
  font-size: 2rem;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
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
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #ff4757;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #2c3e50;
`

const detailsStyle = css`
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
`

const detailsTitleStyle = css`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
`

const detailItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;

  &:last-child {
    border-bottom: none;
  }
`

const labelStyle = css`
  font-weight: 500;
  color: #6c757d;
  font-size: 0.9rem;
  flex-shrink: 0;
  margin-right: 1rem;
`

const valueStyle = css`
  color: #2c3e50;
  font-weight: 600;
  text-align: right;
  font-size: 0.9rem;
`

const actionsStyle = css`
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
`

const primaryButtonStyle = css`
  width: 100%;
  background: linear-gradient(135deg, #ff4757, #ff3742);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`

export default AccidentReportModal
