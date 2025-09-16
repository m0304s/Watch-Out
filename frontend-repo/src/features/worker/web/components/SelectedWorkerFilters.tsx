import { useMemo } from 'react'
import { css } from '@emotion/react'
import type { TrainingStatus, WorkerFilterState } from '@/features/worker/types'

interface SelectedWorkerFiltersProps {
  state: WorkerFilterState
  onChange: (next: Partial<WorkerFilterState>) => void
  areaOptions: string[]
  onSearch?: () => void
}

const trainingStatusOptions: { label: string; value: TrainingStatus }[] = [
  { label: '교육완료', value: 'COMPLETED' },
  { label: '만료', value: 'EXPIRED' },
  { label: '미이수', value: 'NOT_COMPLETED' },
]

// 정렬 옵션은 현재 UI에서 미사용 (서버 정렬로 이전 예정)

export const SelectedWorkerFilters = ({
  state,
  onChange,
  areaOptions,
  onSearch,
}: SelectedWorkerFiltersProps) => {
  // 단일 선택으로 변경 (같은 값 클릭 시 해제)
  const toggleArrayValue = (list: string[], value: string): string[] =>
    list.includes(value) ? [] : [value]

  const toggleStatus = (
    list: TrainingStatus[],
    value: TrainingStatus,
  ): TrainingStatus[] => (list.includes(value) ? [] : [value])

  // 엔터키 검색 핸들러
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch()
    }
  }

  const derivedChips = useMemo(
    () => ({
      areas: areaOptions,
      statuses: trainingStatusOptions,
    }),
    [areaOptions],
  )

  return (
    <div css={section.container}>
      {/* 회사 필터 제거 */}

      <div css={section.row}>
        <span css={section.label}>구역</span>
        {derivedChips.areas.map((area) => (
          <button
            key={area}
            css={section.chip(state.areas.includes(area))}
            onClick={() =>
              onChange({ areas: toggleArrayValue(state.areas, area) })
            }
          >
            {area}
          </button>
        ))}
      </div>

      <div css={section.row}>
        <span css={section.label}>교육상태</span>
        {derivedChips.statuses.map(({ label, value }) => (
          <button
            key={value}
            css={section.chip(state.statuses.includes(value))}
            onClick={() =>
              onChange({ statuses: toggleStatus(state.statuses, value) })
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div css={section.divider} />

      <div css={section.row}>
        <span css={section.label}>검색</span>
        <input
          placeholder="이름으로 검색"
          value={state.search}
          onChange={(e) => onChange({ search: e.target.value })}
          onKeyPress={handleSearchKeyPress}
          css={section.input}
        />
        <button type="button" onClick={onSearch} css={searchButtonStyles}>
          검색
        </button>
      </div>
    </div>
  )
}

const section = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background-color: var(--color-bg-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  `,
  row: css`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  `,
  label: css`
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-800);
    font-size: 14px;
    min-width: 64px;
  `,
  input: css`
    width: 240px;
    padding: 10px 12px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
  `,
  chip: (active: boolean) => css`
    padding: 8px 12px;
    border-radius: 999px;
    background-color: ${active
      ? 'var(--color-primary)'
      : 'var(--color-gray-100)'};
    color: ${active ? 'var(--color-text-white)' : 'var(--color-gray-800)'};
    border: 1px solid ${active ? 'transparent' : 'var(--color-gray-300)'};
    font-size: 13px;
    cursor: pointer;
    user-select: none;

    &:hover {
      opacity: 0.9;
    }
  `,
  divider: css`
    height: 1px;
    background-color: var(--color-gray-200);
    margin: 8px 0;
  `,
}

const searchButtonStyles = css`
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background-color: var(--color-primary);
  color: var(--color-text-white);
  font-size: 14px;
  font-family: 'PretendardSemiBold', sans-serif;
  cursor: pointer;
`
