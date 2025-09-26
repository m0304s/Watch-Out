import { css } from '@emotion/react'
import { useState, useRef } from 'react'
import type { FacePhotoType } from '@/features/auth/types'

interface FacePhotoCaptureProps {
  type: FacePhotoType
  onPhotoCapture: (file: File) => void
  capturedPhoto?: string
  disabled?: boolean
}

export const FacePhotoCapture = ({
  type,
  onPhotoCapture,
  capturedPhoto,
  disabled = false,
}: FacePhotoCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getTypeLabel = () => {
    switch (type) {
      case 'front':
        return '정면'
      case 'left':
        return '좌측'
      case 'right':
        return '우측'
      default:
        return ''
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onPhotoCapture(file)
    }
  }

  const handleCaptureClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleRetakeClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  return (
    <div css={containerStyles}>
      <div css={headerStyles}>
        <h3 css={titleStyles}>{getTypeLabel()} 사진</h3>
      </div>

      <div css={photoContainerStyles}>
        {capturedPhoto ? (
          <div css={capturedPhotoStyles}>
            <img
              src={capturedPhoto}
              alt={`${getTypeLabel()} 사진`}
              css={photoStyles}
            />
            <button
              css={retakeButtonStyles}
              onClick={handleRetakeClick}
              disabled={disabled}
            >
              다시 등록
            </button>
          </div>
        ) : (
          <div css={placeholderStyles}>
            <div css={cameraIconStyles}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="13"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <button
              css={captureButtonStyles}
              onClick={handleCaptureClick}
              disabled={disabled}
            >
              사진 등록
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        css={hiddenInputStyles}
      />
    </div>
  )
}

const containerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const headerStyles = css`
  text-align: center;
`

const titleStyles = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 8px 0;
`

const photoContainerStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`

const capturedPhotoStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const photoStyles = css`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid var(--color-primary);
`

const placeholderStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  border: 2px dashed var(--color-gray-300);
  border-radius: 12px;
  background: var(--color-gray-50);
`

const cameraIconStyles = css`
  color: var(--color-gray-400);
`

const captureButtonStyles = css`
  padding: 12px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary-dark);
  }

  &:disabled {
    background: var(--color-gray-300);
    cursor: not-allowed;
  }
`

const retakeButtonStyles = css`
  padding: 8px 16px;
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-gray-200);
  }

  &:disabled {
    background: var(--color-gray-100);
    color: var(--color-gray-400);
    cursor: not-allowed;
  }
`

const hiddenInputStyles = css`
  display: none;
`
