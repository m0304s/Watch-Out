import { css } from '@emotion/react'

interface BottomActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onDelete: () => void
}

export const BottomActionBar = ({
  selectedCount,
  onClearSelection,
  onDelete,
}: BottomActionBarProps) => {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div css={styles.container}>
      <div css={styles.buttonGroup}>
        <button
          type="button"
          css={styles.clearButton}
          onClick={onClearSelection}
        >
          <div css={styles.iconContainer}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span css={styles.buttonText}>선택됨</span>
        </button>

        <div css={styles.divider} />

        <button type="button" css={styles.deleteButton} onClick={onDelete}>
          <div css={styles.iconContainer}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H5H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span css={styles.buttonText}>삭제</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  buttonGroup: css`
    display: flex;
    align-items: center;
    background-color: var(--color-gray-700);
    border-radius: 8px;
    padding: 2px;
    gap: 0;
  `,
  clearButton: css`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: none;
    border: none;
    color: var(--color-text-white);
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 13px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-gray-600);
    }

    &:active {
      background-color: var(--color-gray-500);
    }
  `,
  deleteButton: css`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: none;
    border: none;
    color: var(--color-text-white);
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 13px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-gray-600);
    }

    &:active {
      background-color: var(--color-gray-500);
    }
  `,
  iconContainer: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
  `,
  buttonText: css`
    white-space: nowrap;
  `,
  divider: css`
    width: 1px;
    height: 24px;
    background-color: var(--color-gray-600);
    margin: 0 4px;
  `,
}
