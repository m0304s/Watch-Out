import { css } from '@emotion/react'

export type LoadingSize = 'small' | 'medium' | 'large'
export type LoadingVariant = 'spinner' | 'dots' | 'pulse'

interface LoadingProps {
  size?: LoadingSize
  variant?: LoadingVariant
  message?: string
  fullScreen?: boolean
  overlay?: boolean
}

export const Loading = ({
  size = 'medium',
  variant = 'spinner',
  message,
  fullScreen = false,
  overlay = false,
}: LoadingProps) => {
  const containerStyles = [
    loadingStyles.container,
    fullScreen && loadingStyles.fullScreen,
    overlay && loadingStyles.overlay,
  ]

  return (
    <div css={containerStyles}>
      <div css={loadingStyles.content}>
        {variant === 'spinner' && (
          <div css={[loadingStyles.spinner, getSizeStyles(size)]} />
        )}
        {variant === 'dots' && (
          <div css={[loadingStyles.dots, getSizeStyles(size)]}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {variant === 'pulse' && (
          <div css={[loadingStyles.pulse, getSizeStyles(size)]} />
        )}
        {message && <div css={loadingStyles.message}>{message}</div>}
      </div>
    </div>
  )
}

// 크기별 스타일
const getSizeStyles = (size: LoadingSize) => {
  switch (size) {
    case 'small':
      return loadingStyles.small
    case 'large':
      return loadingStyles.large
    default:
      return loadingStyles.medium
  }
}

const loadingStyles = {
  container: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  `,

  fullScreen: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background-color: rgba(255, 255, 255, 0.9);
  `,

  overlay: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 1000;
  `,

  content: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  `,

  // 스피너 스타일
  spinner: css`
    border: 3px solid var(--color-gray-200);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,

  // 도트 스타일
  dots: css`
    display: flex;
    gap: 4px;

    span {
      border-radius: 50%;
      background-color: var(--color-primary);
      animation: bounce 1.4s ease-in-out infinite both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }

      &:nth-child(3) {
        animation-delay: 0s;
      }
    }

    @keyframes bounce {
      0%,
      80%,
      100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
  `,

  // 펄스 스타일
  pulse: css`
    border-radius: 50%;
    background-color: var(--color-primary);
    animation: pulse 1.5s ease-in-out infinite;

    @keyframes pulse {
      0% {
        transform: scale(0.95);
        opacity: 0.7;
      }
      70% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(0.95);
        opacity: 0.7;
      }
    }
  `,

  // 크기별 스타일
  small: css`
    width: 20px;
    height: 20px;
  `,

  medium: css`
    width: 32px;
    height: 32px;
  `,

  large: css`
    width: 48px;
    height: 48px;
  `,

  // 메시지 스타일
  message: css`
    color: var(--color-gray-600);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
    text-align: center;
  `,
}
