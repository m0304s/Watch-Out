import { type ReactNode, type FormEvent } from 'react'
import { css } from '@emotion/react'
import { BaseModal } from './BaseModal'
import { ModalHeader } from './ModalHeader'
import { ModalContent } from './ModalContent'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onSubmit: (e: FormEvent) => void
  children: ReactNode
  loading?: boolean
  submitText?: string
  cancelText?: string
  showActions?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const FormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  children,
  loading = false,
  submitText = '저장',
  cancelText = '취소',
  showActions = true,
  size = 'medium',
}: FormModalProps) => {
  const handleClose = () => {
    if (loading) return
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size={size}
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <ModalHeader
        title={title}
        onClose={handleClose}
        showCloseButton={!loading}
      />

      <form css={formModalStyles.form} onSubmit={onSubmit}>
        <ModalContent>{children}</ModalContent>

        {showActions && (
          <div css={formModalStyles.actions}>
            <button
              type="button"
              css={formModalStyles.cancelButton}
              onClick={handleClose}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="submit"
              css={formModalStyles.submitButton}
              disabled={loading}
            >
              {loading ? '처리 중...' : submitText}
            </button>
          </div>
        )}
      </form>
    </BaseModal>
  )
}

const formModalStyles = {
  form: css`
    display: flex;
    flex-direction: column;
    height: 100%;
  `,
  actions: css`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 20px 24px;
    border-top: 1px solid var(--color-gray-200);
    background-color: var(--color-bg-white);
  `,
  cancelButton: css`
    padding: 12px 24px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    background-color: var(--color-bg-white);
    color: var(--color-gray-700);
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--color-gray-100);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  submitButton: css`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
}
