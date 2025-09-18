import { css } from '@emotion/react'

interface ModalLoadingProps {
  message?: string
}

export const ModalLoading = ({
  message = '정보를 불러오는 중...',
}: ModalLoadingProps) => {
  return (
    <div css={modalLoadingStyles.container}>
      <div css={modalLoadingStyles.spinner} />
      <div css={modalLoadingStyles.text}>{message}</div>
    </div>
  )
}

const modalLoadingStyles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    gap: 16px;
  `,
  spinner: css`
    width: 32px;
    height: 32px;
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
  text: css`
    color: var(--color-gray-600);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
  `,
}
