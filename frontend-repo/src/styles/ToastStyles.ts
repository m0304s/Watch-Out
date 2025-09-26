import { css } from '@emotion/react'

export const toastStyles = css`
  .Toastify__toast--success {
    background: #57ad5a;
    color: white;
  }

  .Toastify__toast--error {
    background: #c53030;
    color: white;
  }

  .Toastify__toast--info {
    background: #3498db;
    color: white;
  }

  .Toastify__toast--warning {
    background: #f1c40f;
    color: white;
  }

  .Toastify__toast {
    border-radius: 12px;
    font-family: 'Noto-Sans', 'Pretendard', sans-serif;
  }

  .Toastify__close-button {
    color: white;
  }

  .Toastify__toast-icon {
    svg {
      fill: #fff;
    }
  }
`
