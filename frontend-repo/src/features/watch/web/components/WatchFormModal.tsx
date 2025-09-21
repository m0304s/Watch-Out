import { useState, type FormEvent } from 'react'
import { css } from '@emotion/react'
import { FormModal } from '@/components/common/Modal/FormModal'
import { createWatch } from '@/features/watch/api/watch'
import type { CreateWatchRequest } from '@/features/watch/types'

interface WatchFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const WatchFormModal = ({
  isOpen,
  onClose,
  onSuccess,
}: WatchFormModalProps) => {
  const [formData, setFormData] = useState<CreateWatchRequest>({
    modelName: '',
    note: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.modelName.trim()) {
      setError('모델명을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await createWatch({
        modelName: formData.modelName.trim(),
        note: formData.note.trim(),
      })

      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({ modelName: '', note: '' })
      onSuccess()
      onClose()
    } catch (err) {
      console.error('워치 등록 실패:', err)
      setError('워치 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return

    // 폼 초기화
    setFormData({ modelName: '', note: '' })
    setError(null)
    onClose()
  }

  const handleInputChange =
    (field: keyof CreateWatchRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
      // 입력 시 에러 메시지 제거
      if (error) setError(null)
    }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="워치 등록"
      onSubmit={handleSubmit}
      loading={loading}
      submitText="등록"
      size="medium"
    >
      <div css={styles.formContent}>
        {error && <div css={styles.errorMessage}>{error}</div>}

        <div css={styles.fieldGroup}>
          <label css={styles.label}>
            모델명 <span css={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={formData.modelName}
            onChange={handleInputChange('modelName')}
            placeholder="워치 모델명을 입력하세요"
            css={styles.input}
            disabled={loading}
            maxLength={100}
          />
        </div>

        <div css={styles.fieldGroup}>
          <label css={styles.label}>비고</label>
          <textarea
            value={formData.note}
            onChange={handleInputChange('note')}
            placeholder="워치에 대한 추가 정보를 입력하세요 (선택사항)"
            css={styles.textarea}
            disabled={loading}
            maxLength={500}
            rows={3}
          />
        </div>
      </div>
    </FormModal>
  )
}

const styles = {
  formContent: css`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  fieldGroup: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  label: css`
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 14px;
    color: var(--color-gray-800);
  `,
  required: css`
    color: var(--color-red);
  `,
  input: css`
    padding: 12px 16px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    &:disabled {
      background-color: var(--color-gray-100);
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--color-gray-400);
    }
  `,
  textarea: css`
    padding: 12px 16px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    &:disabled {
      background-color: var(--color-gray-100);
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--color-gray-400);
    }
  `,
  errorMessage: css`
    padding: 12px 16px;
    background-color: var(--color-red-light);
    border: 1px solid var(--color-red);
    border-radius: 8px;
    color: var(--color-red);
    font-size: 14px;
    font-family: 'PretendardMedium', sans-serif;
  `,
}
