import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import { createArea, updateArea } from '@/features/cctv/api/areaApi'
import { FormModal } from '@/components/common/Modal'
import type { AreaItem, CreateAreaRequest } from '@/features/cctv/types'

interface AreaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingArea?: AreaItem | null // 수정 모드일 때만 전달
}

export const AreaFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingArea,
}: AreaFormModalProps) => {
  const isEditMode = !!editingArea

  const [formData, setFormData] = useState<CreateAreaRequest>({
    areaName: '',
    areaAlias: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<Partial<CreateAreaRequest>>({})

  // 모달이 열릴 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingArea) {
        // 수정 모드: 기존 데이터로 초기화
        setFormData({
          areaName: editingArea.areaName,
          areaAlias: editingArea.areaAlias,
        })
      } else {
        // 생성 모드: 빈 폼으로 초기화
        setFormData({
          areaName: '',
          areaAlias: '',
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditMode, editingArea])

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateAreaRequest> = {}

    if (!formData.areaName.trim()) {
      newErrors.areaName = '구역 이름을 입력해주세요.'
    } else if (formData.areaName.trim().length < 2) {
      newErrors.areaName = '구역 이름은 2자 이상 입력해주세요.'
    }

    if (!formData.areaAlias.trim()) {
      newErrors.areaAlias = '구역 별칭을 입력해주세요.'
    } else if (formData.areaAlias.trim().length < 2) {
      newErrors.areaAlias = '구역 별칭은 2자 이상 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      if (isEditMode && editingArea) {
        // 수정 모드
        await updateArea(editingArea.areaUuid, {
          areaName: formData.areaName.trim(),
          areaAlias: formData.areaAlias.trim(),
        })
        alert('구역이 성공적으로 수정되었습니다.')
      } else {
        // 생성 모드
        await createArea({
          areaName: formData.areaName.trim(),
          areaAlias: formData.areaAlias.trim(),
        })
        alert('구역이 성공적으로 생성되었습니다.')
      }

      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({ areaName: '', areaAlias: '' })
      setErrors({})
      onSuccess()
      onClose()
    } catch (error) {
      console.error(`${isEditMode ? '구역 수정' : '구역 생성'} 실패:`, error)
      alert(
        `${isEditMode ? '구역 수정' : '구역 생성'}에 실패했습니다. 다시 시도해주세요.`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateAreaRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (loading) return
    setFormData({ areaName: '', areaAlias: '' })
    setErrors({})
    onClose()
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? '구역 수정' : '새 구역 생성'}
      onSubmit={handleSubmit}
      loading={loading}
      submitText={isEditMode ? '수정하기' : '생성하기'}
    >
      <div css={styles.field}>
        <label css={styles.label} htmlFor="areaName">
          구역 이름 *
        </label>
        <input
          id="areaName"
          type="text"
          css={[styles.input, errors.areaName && styles.inputError]}
          value={formData.areaName}
          onChange={(e) => handleInputChange('areaName', e.target.value)}
          placeholder="구역 이름을 입력하세요"
          disabled={loading}
          maxLength={50}
        />
        {errors.areaName && (
          <span css={styles.errorText}>{errors.areaName}</span>
        )}
      </div>

      <div css={styles.field}>
        <label css={styles.label} htmlFor="areaAlias">
          구역 별칭 *
        </label>
        <input
          id="areaAlias"
          type="text"
          css={[styles.input, errors.areaAlias && styles.inputError]}
          value={formData.areaAlias}
          onChange={(e) => handleInputChange('areaAlias', e.target.value)}
          placeholder="구역 별칭을 입력하세요"
          disabled={loading}
          maxLength={30}
        />
        {errors.areaAlias && (
          <span css={styles.errorText}>{errors.areaAlias}</span>
        )}
      </div>
    </FormModal>
  )
}

const styles = {
  field: css`
    margin-bottom: 20px;
  `,
  label: css`
    display: block;
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-800);
    font-size: 14px;
    margin-bottom: 8px;
  `,
  input: css`
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;
    font-family: 'PretendardRegular', sans-serif;
    transition: all 0.2s ease;

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
      color: var(--color-gray-500);
    }
  `,
  inputError: css`
    border-color: var(--color-red);

    &:focus {
      border-color: var(--color-red);
      box-shadow: 0 0 0 3px rgba(255, 24, 24, 0.1);
    }
  `,
  errorText: css`
    display: block;
    color: var(--color-red);
    font-size: 12px;
    margin-top: 4px;
    font-family: 'PretendardRegular', sans-serif;
  `,
}
