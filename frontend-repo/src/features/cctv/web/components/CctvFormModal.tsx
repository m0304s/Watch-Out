import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import { createCctv, updateCctv } from '@/features/cctv/api/cctvApi'
import { getAreas } from '@/features/cctv/api/areaApi'
import { FormModal } from '@/components/common/Modal'
import type {
  AreaItem,
  CreateCctvRequest,
  CctvItem,
} from '@/features/cctv/types'

interface CctvFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingCctv?: CctvItem | null
}

export const CctvFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingCctv,
}: CctvFormModalProps) => {
  const [formData, setFormData] = useState<CreateCctvRequest>({
    cctvName: '',
    cctvUrl: '',
    isOnline: true,
    type: 'CCTV',
    areaUuid: '',
  })
  const [areas, setAreas] = useState<AreaItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<Partial<CreateCctvRequest>>({})

  // 모달이 열릴 때 구역 목록 조회 및 폼 초기화
  useEffect(() => {
    if (isOpen) {
      const fetchAreas = async () => {
        try {
          const res = await getAreas({ pageNum: 0, display: 1000, search: '' })
          setAreas(res.data)
        } catch (error) {
          console.error('구역 목록 조회 실패:', error)
        }
      }

      void fetchAreas()

      // 폼 초기화 (수정 모드인 경우 기존 데이터로 채움)
      setFormData({
        cctvName: editingCctv?.cctvName || '',
        cctvUrl: editingCctv?.cctvUrl || '',
        isOnline: editingCctv?.isOnline ?? true,
        type: editingCctv?.type || 'CCTV',
        areaUuid: editingCctv?.areaUuid || '',
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCctvRequest> = {}

    if (!formData.cctvName.trim()) {
      newErrors.cctvName = 'CCTV 이름을 입력해주세요.'
    } else if (formData.cctvName.trim().length < 2) {
      newErrors.cctvName = 'CCTV 이름은 2자 이상 입력해주세요.'
    }

    if (!formData.cctvUrl.trim()) {
      newErrors.cctvUrl = 'CCTV URL을 입력해주세요.'
    } else {
      // URL 형식 검증
      try {
        new URL(formData.cctvUrl.trim())
      } catch {
        newErrors.cctvUrl = '올바른 URL 형식을 입력해주세요.'
      }
    }

    if (!formData.areaUuid) {
      newErrors.areaUuid = '구역을 선택해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      if (editingCctv) {
        // 수정 모드
        await updateCctv(editingCctv.cctvUuid, {
          cctvName: formData.cctvName.trim(),
          cctvUrl: formData.cctvUrl.trim(),
          isOnline: formData.isOnline,
          type: formData.type,
          areaUuid: formData.areaUuid,
        })
        alert('CCTV가 성공적으로 수정되었습니다.')
      } else {
        // 생성 모드
        await createCctv({
          cctvName: formData.cctvName.trim(),
          cctvUrl: formData.cctvUrl.trim(),
          isOnline: formData.isOnline,
          type: formData.type,
          areaUuid: formData.areaUuid,
        })
        alert('CCTV가 성공적으로 생성되었습니다.')
      }

      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({
        cctvName: '',
        cctvUrl: '',
        isOnline: true,
        type: 'CCTV',
        areaUuid: '',
      })
      setErrors({})
      onSuccess()
      onClose()
    } catch (error) {
      console.error('CCTV 처리 실패:', error)
      alert(
        `CCTV ${editingCctv ? '수정' : '생성'}에 실패했습니다. 다시 시도해주세요.`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateCctvRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (loading) return
    setFormData({
      cctvName: '',
      cctvUrl: '',
      isOnline: true,
      type: 'CCTV',
      areaUuid: '',
    })
    setErrors({})
    onClose()
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingCctv ? 'CCTV 수정' : '새 CCTV 생성'}
      onSubmit={handleSubmit}
      loading={loading}
      submitText={editingCctv ? '수정하기' : '생성하기'}
    >
      <div css={styles.field}>
        <label css={styles.label} htmlFor="cctvName">
          CCTV 이름 *
        </label>
        <input
          id="cctvName"
          type="text"
          css={[styles.input, errors.cctvName && styles.inputError]}
          value={formData.cctvName}
          onChange={(e) => handleInputChange('cctvName', e.target.value)}
          placeholder="CCTV 이름을 입력하세요"
          disabled={loading}
          maxLength={50}
        />
        {errors.cctvName && (
          <span css={styles.errorText}>{errors.cctvName}</span>
        )}
      </div>

      <div css={styles.field}>
        <label css={styles.label} htmlFor="cctvUrl">
          CCTV URL *
        </label>
        <input
          id="cctvUrl"
          type="url"
          css={[styles.input, errors.cctvUrl && styles.inputError]}
          value={formData.cctvUrl}
          onChange={(e) => handleInputChange('cctvUrl', e.target.value)}
          placeholder="https://example.com/cctv"
          disabled={loading}
        />
        {errors.cctvUrl && <span css={styles.errorText}>{errors.cctvUrl}</span>}
      </div>

      <div css={styles.field}>
        <label css={styles.label} htmlFor="areaUuid">
          구역 *
        </label>
        <select
          id="areaUuid"
          css={[styles.select, errors.areaUuid && styles.inputError]}
          value={formData.areaUuid}
          onChange={(e) => handleInputChange('areaUuid', e.target.value)}
          disabled={loading}
        >
          <option value="">구역을 선택하세요</option>
          {areas.map((area) => (
            <option key={area.areaUuid} value={area.areaUuid}>
              {area.areaAlias || area.areaName}
            </option>
          ))}
        </select>
        {errors.areaUuid && (
          <span css={styles.errorText}>{errors.areaUuid}</span>
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
  select: css`
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;
    font-family: 'PretendardRegular', sans-serif;
    background-color: var(--color-bg-white);
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
