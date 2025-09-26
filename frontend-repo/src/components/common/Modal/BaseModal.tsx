import { useEffect, type ReactNode } from 'react'
import { css } from '@emotion/react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  variant?: 'default' | 'mobile' | 'cctv'
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
}

export const BaseModal = ({
  isOpen,
  onClose,
  children,
  size = 'medium',
  variant = 'default',
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: BaseModalProps) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, closeOnEscape])

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div css={modalStyles.backdrop} onClick={handleBackdropClick}>
      <div
        css={[
          modalStyles.container,
          getSizeStyles(size),
          getVariantStyles(variant),
        ]}
      >
        {children}
      </div>
    </div>
  )
}

// 크기별 스타일
const getSizeStyles = (size: BaseModalProps['size']) => {
  switch (size) {
    case 'small':
      return modalStyles.small
    case 'large':
      return modalStyles.large
    case 'fullscreen':
      return modalStyles.fullscreen
    default:
      return modalStyles.medium
  }
}

// 변형별 스타일
const getVariantStyles = (variant: BaseModalProps['variant']) => {
  switch (variant) {
    case 'mobile':
      return modalStyles.mobile
    case 'cctv':
      return modalStyles.cctv
    default:
      return modalStyles.default
  }
}

const modalStyles = {
  backdrop: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  `,
  container: css`
    background-color: var(--color-bg-white);
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,
  // 크기별 스타일
  small: css`
    width: 100%;
    max-width: 400px;
  `,
  medium: css`
    width: 100%;
    max-width: 600px;
  `,
  large: css`
    width: 100%;
    max-width: 800px;
  `,
  fullscreen: css`
    width: 100%;
    max-width: 1200px;
    height: 90vh;
  `,
  // 변형별 스타일
  default: css`
    /* 기본 스타일 */
  `,
  mobile: css`
    border-radius: 20px 20px 0 0;
    margin-top: auto;
    max-height: 90vh;
    height: auto;
  `,
  cctv: css`
    background-color: transparent;
    box-shadow: none;
    border-radius: 0;
    max-width: 90%;
    width: 90%;
    max-height: none;
    height: auto;
  `,
}
