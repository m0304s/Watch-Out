import { type ReactNode } from 'react'
import { css } from '@emotion/react'

interface ModalHeaderProps {
  title: string
  onClose?: () => void
  showCloseButton?: boolean
  variant?: 'default' | 'mobile'
  children?: ReactNode
}

export const ModalHeader = ({
  title,
  onClose,
  showCloseButton = true,
  variant = 'default',
  children,
}: ModalHeaderProps) => {
  return (
    <div css={[modalHeaderStyles.header, getVariantStyles(variant)]}>
      {variant === 'mobile' && (
        <button css={modalHeaderStyles.backButton} onClick={onClose}>
          ←
        </button>
      )}

      <h2 css={modalHeaderStyles.title}>{title}</h2>

      {variant === 'default' && showCloseButton && (
        <button
          css={modalHeaderStyles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>
      )}

      {variant === 'mobile' && <div css={modalHeaderStyles.headerSpacer} />}

      {children}
    </div>
  )
}

const getVariantStyles = (variant: ModalHeaderProps['variant']) => {
  switch (variant) {
    case 'mobile':
      return modalHeaderStyles.mobile
    default:
      return modalHeaderStyles.default
  }
}

const modalHeaderStyles = {
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--color-gray-200);
  `,
  default: css`
    /* 기본 스타일 */
  `,
  mobile: css`
    padding: 16px 20px;
    background-color: var(--color-bg-white);
    position: sticky;
    top: 0;
    z-index: 10;
  `,
  title: css`
    margin: 0;
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 18px;
    color: var(--color-gray-900);
  `,
  closeButton: css`
    background: none;
    border: none;
    font-size: 20px;
    color: var(--color-gray-500);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-gray-100);
    }
  `,
  backButton: css`
    background: none;
    border: none;
    font-size: 24px;
    color: var(--color-gray-700);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;

    &:hover {
      background-color: var(--color-gray-100);
    }
  `,
  headerSpacer: css`
    width: 40px;
  `,
}
