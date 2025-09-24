import { css } from '@emotion/react'
import { useState, useMemo } from 'react'
import type { NoticeFormData, Area } from '@/features/notice/types'

interface NoticeSendFormProps {
  areas: Area[]
  onSubmit: (data: NoticeFormData) => void
  isLoading?: boolean
}

const NoticeSendForm = ({ areas, onSubmit, isLoading = false }: NoticeSendFormProps) => {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    targetAreas: [],
    isAllTarget: false
  })

  const [showAreaDropdown, setShowAreaDropdown] = useState(false)

  const handleAllTargetChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isAllTarget: checked,
      targetAreas: checked ? [] : prev.targetAreas
    }))
  }

  const handleAreaToggle = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      targetAreas: prev.targetAreas.includes(areaId)
        ? prev.targetAreas.filter(id => id !== areaId)
        : [...prev.targetAreas, areaId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData)
      // 폼 초기화
      setFormData({
        title: '',
        content: '',
        targetAreas: [],
        isAllTarget: false
      })
    }
  }

  const selectedAreas = useMemo(() => {
    return areas?.filter(area => formData.targetAreas.includes(area.id)) || []
  }, [areas, formData.targetAreas])

  const hasSelectedAreas = useMemo(() => {
    return formData.targetAreas.length > 0 && selectedAreas.length > 0
  }, [formData.targetAreas.length, selectedAreas.length])

  return (
    <div css={container}>
      <form onSubmit={handleSubmit}>
        {/* 발송 대상 섹션 */}
        <div css={section}>
          <h3 css={sectionTitle}>발송 대상</h3>
          
          <div css={checkboxContainer}>
            <label css={checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isAllTarget}
                onChange={(e) => handleAllTargetChange(e.target.checked)}
                css={checkbox}
              />
              <span css={checkboxText}>전체</span>
            </label>
          </div>

          {!formData.isAllTarget && (
            <div css={areaSelector}>
              <div css={areaDropdownContainer}>
                <button
                  type="button"
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                  css={areaDropdownButton}
                >
                  <span css={areaDropdownText}>
                    {hasSelectedAreas 
                      ? `${selectedAreas.length}개 구역 선택됨`
                      : '구역 선택'
                    }
                  </span>
                  <span css={dropdownArrow(showAreaDropdown)}>▼</span>
                </button>
                
                {showAreaDropdown && (
                  <div css={areaDropdown}>
                    {areas?.map(area => {
                      const isChecked = formData.targetAreas.includes(area.id)
                      return (
                        <label key={area.id} css={areaOption}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleAreaToggle(area.id)}
                            css={checkbox}
                          />
                          <span css={areaOptionText}>{area.name}</span>
                        </label>
                      )
                    }) || []}
                  </div>
                )}
              </div>

              {/* 선택된 구역 태그들 */}
              {hasSelectedAreas && (
                <div css={selectedAreasContainer}>
                  {selectedAreas.map(area => (
                    <div key={area.id} css={areaTag}>
                      {area.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 제목 입력 섹션 */}
        <div css={section}>
          <h3 css={sectionTitle}>제목</h3>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="공지사항 제목을 입력해주세요"
            css={titleInput}
          />
        </div>

        {/* 메시지 입력 섹션 */}
        <div css={section}>
          <h3 css={sectionTitle}>내용</h3>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="공지사항 내용을 입력해주세요"
            css={messageTextarea}
            rows={8}
          />
        </div>

        {/* 발송 버튼 */}
        <div css={buttonContainer}>
          <button
            type="submit"
            disabled={!formData.title.trim() || !formData.content.trim() || isLoading}
            css={sendButton}
          >
            {isLoading ? '발송 중...' : '발송'}
            <span css={sendIcon}>▶</span>
          </button>
        </div>
      </form>
    </div>
  )
}

const container = css`
  padding: 20px;
  background-color: var(--color-bg-white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const section = css`
  margin-bottom: 24px;
`

const sectionTitle = css`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-800);
`

const checkboxContainer = css`
  margin-bottom: 16px;
`

const checkboxLabel = css`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-gray-700);
`

const checkbox = css`
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
`

const checkboxText = css`
  font-weight: 500;
`

const areaSelector = css`
  margin-top: 12px;
`

const areaDropdownContainer = css`
  position: relative;
  margin-bottom: 12px;
`

const areaDropdownButton = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  background-color: var(--color-bg-white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-primary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`

const areaDropdownText = css`
  color: var(--color-gray-700);
`

const dropdownArrow = (isOpen: boolean) => css`
  color: var(--color-gray-500);
  transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s;
  font-size: 12px;
`

const areaDropdown = css`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
`

const areaOption = css`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-gray-100);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-gray-50);
  }
`

const areaOptionText = css`
  font-size: 14px;
  color: var(--color-gray-700);
`

const selectedAreasContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`

const areaTag = css`
  padding: 4px 8px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`

const titleInput = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &::placeholder {
    color: var(--color-gray-400);
  }
`

const messageTextarea = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &::placeholder {
    color: var(--color-gray-400);
  }
`

const buttonContainer = css`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`

const sendButton = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: var(--color-primary);
  color: var(--color-text-white);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const sendIcon = css`
  font-size: 12px;
`

export default NoticeSendForm
