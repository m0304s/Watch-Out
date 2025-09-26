import { css } from '@emotion/react'

interface ModalErrorProps {
  message: string
  onRetry?: () => void
  retryText?: string
}

export const ModalError = ({
  message,
  onRetry,
  retryText = '다시 시도',
}: ModalErrorProps) => {
  return (
    <div css={modalErrorStyles.container}>
      <div css={modalErrorStyles.icon}>⚠️</div>
      <div css={modalErrorStyles.text}>{message}</div>
      {onRetry && (
        <button css={modalErrorStyles.retryButton} onClick={onRetry}>
          {retryText}
        </button>
      )}
    </div>
  )
}

const modalErrorStyles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    gap: 16px;
  `,
  icon: css`
    font-size: 32px;
  `,
  text: css`
    color: var(--color-red);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
    text-align: center;
    line-height: 1.5;
  `,
  retryButton: css`
    padding: 8px 16px;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    border: none;
    border-radius: 6px;
    font-family: 'PretendardMedium', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  `,
}
