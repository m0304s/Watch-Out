import { css } from '@emotion/react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
  areaName?: string
  cctvName?: string
  equipmentTypes?: string
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title, 
  areaName, 
  cctvName, 
  equipmentTypes 
}) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div css={modalOverlay} onClick={handleOverlayClick}>
      <div css={modalContent} onClick={(e) => e.stopPropagation()}>
        <div css={modalHeader}>
          <h2 css={modalTitle}>{title}</h2>
          <button css={closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div css={modalBody}>
          <div css={imageContainer}>
            <img src={imageUrl} alt="Detection Snapshot" css={detectionImage} />
          </div>
          <div css={detailSection}>
            {areaName && (
              <p css={detailItem}><strong>구역명:</strong> {areaName}</p>
            )}
            {cctvName && (
              <p css={detailItem}><strong>CCTV명:</strong> {cctvName}</p>
            )}
            {equipmentTypes && (
              <p css={detailItem}><strong>감지된 장비:</strong> {equipmentTypes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
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
  max-width: 800px;
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
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const imageContainer = css`
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--color-gray-100);
  display: flex;
  justify-content: center;
  align-items: center;
`

const detectionImage = css`
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
`

const detailSection = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const detailItem = css`
  font-size: 16px;
  color: var(--color-gray-700);
  margin: 0;
  line-height: 1.5;

  strong {
    color: var(--color-gray-900);
    margin-right: 8px;
  }
`

export default ImageModal
