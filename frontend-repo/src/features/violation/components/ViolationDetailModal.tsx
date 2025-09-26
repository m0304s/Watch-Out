import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { violationApi, type ViolationDetail } from '@/features/violation/services/violationApi'

interface ViolationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  violationUuid: string | null
}

const ViolationDetailModal: React.FC<ViolationDetailModalProps> = ({ isOpen, onClose, violationUuid }) => {
  const [violationDetail, setViolationDetail] = useState<ViolationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // violation 상세 정보 조회
  useEffect(() => {
    if (!isOpen || !violationUuid) {
      setViolationDetail(null)
      setError(null)
      return
    }

    const fetchViolationDetail = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const detail = await violationApi.getViolationDetail(violationUuid)
        setViolationDetail(detail)
      } catch (err) {
        console.error('Violation 상세 정보 조회 실패:', err)
        setError('상세 정보를 불러올 수 없습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchViolationDetail()
  }, [isOpen, violationUuid])

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    setViolationDetail(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div css={modalOverlay} onClick={handleClose}>
      <div css={modalContent} onClick={(e) => e.stopPropagation()}>
        <div css={modalHeader}>
          <h2 css={modalTitle}>안전장비 위반 상세</h2>
          <button css={closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <div css={modalBody}>
          {isLoading && (
            <div css={loadingContainer}>
              <div css={loadingSpinner}></div>
              <div css={loadingText}>상세 정보를 불러오는 중...</div>
            </div>
          )}

          {error && (
            <div css={errorContainer}>
              <div css={errorIcon}>⚠️</div>
              <div css={errorText}>{error}</div>
            </div>
          )}

          {violationDetail && !isLoading && (
            <div css={detailContainer}>
              {/* 이미지 */}
              <div css={imageContainer}>
                <img 
                  src={violationDetail.imageUrl} 
                  alt="위반 이미지" 
                  css={violationImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>

              {/* 상세 정보 */}
              <div css={infoContainer}>
                <div css={infoRow}>
                  <div css={infoLabel}>구역명</div>
                  <div css={infoValue}>{violationDetail.areaName}</div>
                </div>

                <div css={infoRow}>
                  <div css={infoLabel}>CCTV명</div>
                  <div css={infoValue}>{violationDetail.cctvName}</div>
                </div>

                <div css={infoRow}>
                  <div css={infoLabel}>위반 유형</div>
                  <div css={infoValue}>
                    <div css={violationTypesContainer}>
                      {violationDetail.violationTypes.map((type, index) => (
                        <span key={index} css={violationTypeTag}>
                          {getViolationTypeDisplayName(type)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div css={infoRow}>
                  <div css={infoLabel}>발생 시간</div>
                  <div css={infoValue}>
                    {new Date(violationDetail.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>

                <div css={infoRow}>
                  <div css={infoLabel}>위반 ID</div>
                  <div css={infoValue}>
                    <code css={uuidCode}>{violationDetail.violationUuid}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 위반 유형을 사용자 친화적인 이름으로 변환
 */
const getViolationTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'HELMET_OFF': '헬멧 미착용',
    'BELT_OFF': '안전벨트 미착용',
    'SAFETY_VEST_OFF': '안전조끼 미착용',
    'SAFETY_SHOES_OFF': '안전화 미착용',
    'GLOVES_OFF': '안전장갑 미착용'
  }
  return typeMap[type] || type
}

const modalOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const modalContent = css`
  background: var(--color-bg-white);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const modalHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-gray-200);
  background: var(--color-gray-50);
`

const modalTitle = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
`

const closeButton = css`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-gray-200);
    color: var(--color-gray-700);
  }
`

const modalBody = css`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`

const loadingContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
`

const loadingSpinner = css`
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const loadingText = css`
  color: var(--color-gray-500);
  font-size: 14px;
`

const errorContainer = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--color-red);
`

const errorIcon = css`
  font-size: 20px;
`

const errorText = css`
  font-size: 14px;
  font-weight: 500;
`

const detailContainer = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const imageContainer = css`
  display: flex;
  justify-content: center;
  background: var(--color-gray-50);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--color-gray-200);
`

const violationImage = css`
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const infoContainer = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const infoRow = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const infoLabel = css`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-700);
`

const infoValue = css`
  font-size: 14px;
  color: var(--color-gray-500);
  word-break: break-all;
`

const violationTypesContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const violationTypeTag = css`
  background: #fef3c7;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #fde68a;
`

const uuidCode = css`
  background: var(--color-gray-100);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--color-gray-700);
  word-break: break-all;
`

export default ViolationDetailModal
