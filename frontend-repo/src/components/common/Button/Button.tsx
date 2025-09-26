import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { css } from '@emotion/react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'success'
export type ButtonSize = 'small' | 'medium' | 'large'
export type ButtonType = 'button' | 'submit' | 'reset'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={className}
      css={[
        buttonStyles.base,
        getVariantStyles(variant),
        getSizeStyles(size),
        fullWidth && buttonStyles.fullWidth,
        isDisabled && buttonStyles.disabled,
      ]}
      {...props}
    >
      {loading && <span css={buttonStyles.loadingSpinner}>⟳</span>}
      {leftIcon && !loading && (
        <span css={buttonStyles.leftIcon}>{leftIcon}</span>
      )}
      <span css={loading && buttonStyles.loadingText}>{children}</span>
      {rightIcon && !loading && (
        <span css={buttonStyles.rightIcon}>{rightIcon}</span>
      )}
    </button>
  )
}

// 버튼 스타일 정의
const buttonStyles = {
  base: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: 8px;
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    outline: none;
    position: relative;
    overflow: hidden;

    &:focus-visible {
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
  `,

  // 크기별 스타일
  small: css`
    padding: 8px 16px;
    font-size: 12px;
    min-height: 32px;
  `,

  medium: css`
    padding: 12px 24px;
    font-size: 14px;
    min-height: 40px;
  `,

  large: css`
    padding: 16px 32px;
    font-size: 16px;
    min-height: 48px;
  `,

  // 변형별 스타일
  primary: css`
    background-color: var(--color-primary);
    color: var(--color-text-white);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }

    &:active:not(:disabled) {
      background-color: var(--color-primary-darker);
    }
  `,

  secondary: css`
    background-color: var(--color-bg-white);
    color: var(--color-gray-700);
    border: 1px solid var(--color-gray-300);

    &:hover:not(:disabled) {
      background-color: var(--color-gray-50);
      border-color: var(--color-gray-400);
    }

    &:active:not(:disabled) {
      background-color: var(--color-gray-100);
    }
  `,

  danger: css`
    background-color: var(--color-red);
    color: var(--color-text-white);

    &:hover:not(:disabled) {
      background-color: var(--color-red-dark);
    }

    &:active:not(:disabled) {
      background-color: var(--color-red-darker);
    }
  `,

  ghost: css`
    background-color: transparent;
    color: var(--color-gray-700);

    &:hover:not(:disabled) {
      background-color: var(--color-gray-100);
    }

    &:active:not(:disabled) {
      background-color: var(--color-gray-200);
    }
  `,

  success: css`
    background-color: var(--color-green);
    color: var(--color-text-white);

    &:hover:not(:disabled) {
      background-color: var(--color-green-dark);
    }

    &:active:not(:disabled) {
      background-color: var(--color-green-darker);
    }
  `,

  // 상태별 스타일
  disabled: css`
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `,

  fullWidth: css`
    width: 100%;
  `,

  // 아이콘 스타일
  leftIcon: css`
    display: flex;
    align-items: center;
  `,

  rightIcon: css`
    display: flex;
    align-items: center;
  `,

  // 로딩 스타일
  loadingSpinner: css`
    display: inline-block;
    animation: spin 1s linear infinite;
    font-size: 16px;
  `,

  loadingText: css`
    opacity: 0.7;
  `,
}

// 변형별 스타일 반환
const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return buttonStyles.primary
    case 'secondary':
      return buttonStyles.secondary
    case 'danger':
      return buttonStyles.danger
    case 'ghost':
      return buttonStyles.ghost
    case 'success':
      return buttonStyles.success
    default:
      return buttonStyles.primary
  }
}

// 크기별 스타일 반환
const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return buttonStyles.small
    case 'medium':
      return buttonStyles.medium
    case 'large':
      return buttonStyles.large
    default:
      return buttonStyles.medium
  }
}

// CSS 애니메이션
const spinKeyframes = css`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

// 전역 스타일에 애니메이션 추가
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = spinKeyframes.styles
  document.head.appendChild(style)
}
