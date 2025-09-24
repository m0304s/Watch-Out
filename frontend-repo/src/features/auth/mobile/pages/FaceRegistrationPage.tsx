import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { FacePhotoCapture } from '@/features/auth/mobile/components/FacePhotoCapture'
import { uploadFaceImages } from '@/features/auth/api/faceApi'
import { useAuth } from '@/stores/authStore'
import type {
  FacePhotos,
  CapturedPhotos,
  FaceRegistrationError,
} from '@/features/auth/types'
import { useToast } from '@/hooks/useToast'

export const MobileFaceRegistrationPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useAuth()
  const [photos, setPhotos] = useState<FacePhotos>({})
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotos>({})
  const [isUploading, setIsUploading] = useState(false)

  // 인증 상태 확인
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다.')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handlePhotoCapture = (type: 'front' | 'left' | 'right', file: File) => {
    setPhotos((prev) => ({ ...prev, [type]: file }))

    // 미리보기를 위한 URL 생성
    const url = URL.createObjectURL(file)
    setCapturedPhotos((prev) => ({ ...prev, [type]: url }))
  }

  const isAllPhotosCaptured = () => {
    return photos.front && photos.left && photos.right
  }

  const handleComplete = async () => {
    if (!isAllPhotosCaptured()) {
      toast.info('모든 사진을 촬영해주세요.')
      return
    }

    setIsUploading(true)

    try {
      await uploadFaceImages({
        front: photos.front!,
        left: photos.left!,
        right: photos.right!,
      })

      toast.success('얼굴 사진 등록이 완료되었습니다!')
      navigate('/worker')
    } catch (err) {
      console.error('얼굴 사진 업로드 실패:', err)

      // FaceRegistrationError인 경우 구체적인 메시지 표시
      if (err && typeof err === 'object' && 'code' in err) {
        const faceError = err as FaceRegistrationError
        toast.error(faceError.message)
      } else {
        toast.error('사진 업로드 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleSkip = () => {
    if (
      confirm(
        '얼굴 사진 등록을 건너뛰시겠습니까? 나중에 설정에서 등록할 수 있습니다.',
      )
    ) {
      navigate('/worker')
    }
  }

  return (
    <div css={pageStyles}>
      <MobileHeader title="얼굴 사진 등록" showBack={false} />

      <main css={mainStyles}>
        <div css={headerSectionStyles}>
          <h1 css={titleStyles}>얼굴 사진 등록</h1>
          <p css={subtitleStyles}>
            출근 확인을 위해 정면, 좌측, 우측 사진을 등록해주세요
          </p>
        </div>

        <div css={photoSectionStyles}>
          <FacePhotoCapture
            type="front"
            onPhotoCapture={(file) => handlePhotoCapture('front', file)}
            capturedPhoto={capturedPhotos.front}
            disabled={isUploading}
          />

          <FacePhotoCapture
            type="left"
            onPhotoCapture={(file) => handlePhotoCapture('left', file)}
            capturedPhoto={capturedPhotos.left}
            disabled={isUploading}
          />

          <FacePhotoCapture
            type="right"
            onPhotoCapture={(file) => handlePhotoCapture('right', file)}
            capturedPhoto={capturedPhotos.right}
            disabled={isUploading}
          />
        </div>

        <div css={buttonSectionStyles}>
          <button
            css={[buttonStyles, completeButtonStyles]}
            onClick={handleComplete}
            disabled={!isAllPhotosCaptured() || isUploading}
          >
            {isUploading ? '업로드 중...' : '등록 완료'}
          </button>

          <button
            css={[buttonStyles, skipButtonStyles]}
            onClick={handleSkip}
            disabled={isUploading}
          >
            나중에 하기
          </button>
        </div>
      </main>
    </div>
  )
}

const pageStyles = css`
  min-height: 100dvh;
  background-color: var(--color-gray-50);
`

const mainStyles = css`
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
`

const headerSectionStyles = css`
  text-align: center;
  margin-bottom: 32px;
`

const titleStyles = css`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0 0 12px 0;
`

const subtitleStyles = css`
  font-size: 16px;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.5;
`

const photoSectionStyles = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
`

const buttonSectionStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
`

const buttonStyles = css`
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`

const completeButtonStyles = css`
  background: var(--color-primary);
  color: white;

  &:hover:not(:disabled) {
    background: var(--color-primary-dark);
  }

  &:disabled {
    background: var(--color-gray-300);
    cursor: not-allowed;
  }
`

const skipButtonStyles = css`
  background: white;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);

  &:hover:not(:disabled) {
    background: var(--color-gray-50);
  }

  &:disabled {
    color: var(--color-gray-400);
    cursor: not-allowed;
  }
`

const infoSectionStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const infoItemStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-blue-50);
  border-radius: 8px;
  border-left: 4px solid var(--color-blue-500);
`

const infoIconStyles = css`
  font-size: 16px;
`

const infoTextStyles = css`
  font-size: 14px;
  color: var(--color-blue-700);
  line-height: 1.4;
`
