import { useMemo } from 'react'
import { css } from '@emotion/react'
import type { TrainingStatus, WorkerFilterState } from '@/features/worker/types'

interface SelectedWorkerFiltersProps {
  state: WorkerFilterState
  onChange: (next: Partial<WorkerFilterState>) => void
  companyOptions: string[]
  areaOptions: string[]
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
    border: 1px solid ${active
      ? 'transparent'
      : 'var(--color-gray-300)'};
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

const trainingStatusOptions: { label: string; value: TrainingStatus }[] = [
  { label: '교육완료', value: 'COMPLETED' },
  { label: '만료', value: 'EXPIRED' },
]

const sortOptions: { key: WorkerFilterState['sortKey']; label: string }[] = [
  { key: 'lastEntryTime', label: '최근 출입시간' },
  { key: 'userName', label: '이름' },
]

export const SelectedWorkerFilters = ({
  state,
  onChange,
  companyOptions,
  areaOptions,
}: SelectedWorkerFiltersProps) => {
  const toggleArrayValue = (
    list: string[],
    value: string,
  ): string[] => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const toggleStatus = (
    list: TrainingStatus[],
    value: TrainingStatus,
  ): TrainingStatus[] => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const derivedChips = useMemo(() => ({
    companies: companyOptions,
    areas: areaOptions,
    statuses: trainingStatusOptions,
  }), [companyOptions, areaOptions])

  return (
    <div css={section.container}>
      <div css={section.row}>
        <span css={section.label}>검색</span>
        <input
          placeholder="이름/사번/회사 검색"
          value={state.search}
          onChange={(e) => onChange({ search: e.target.value })}
          css={section.input}
        />
      </div>

      <div css={section.row}>
        <span css={section.label}>회사</span>
        {derivedChips.companies.map((c) => (
          <button
            key={c}
            css={section.chip(state.companies.includes(c))}
            onClick={() => onChange({ companies: toggleArrayValue(state.companies, c) })}
          >
            {c}
          </button>
        ))}
      </div>

      <div css={section.row}>
        <span css={section.label}>구역</span>
        {derivedChips.areas.map((a) => (
          <button
            key={a}
            css={section.chip(state.areas.includes(a))}
            onClick={() => onChange({ areas: toggleArrayValue(state.areas, a) })}
          >
            {a}
          </button>
        ))}
      </div>

      <div css={section.row}>
        <span css={section.label}>교육상태</span>
        {derivedChips.statuses.map(({ label, value }) => (
          <button
            key={value}
            css={section.chip(state.statuses.includes(value))}
            onClick={() => onChange({ statuses: toggleStatus(state.statuses, value) })}
          >
            {label}
          </button>
        ))}
      </div>

      <div css={section.divider} />

      <div css={section.row}>
        <span css={section.label}>정렬</span>
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            css={section.chip(state.sortKey === key)}
            onClick={() => onChange({ sortKey: key })}
          >
            {label}
          </button>
        ))}

        <button
          css={section.chip(state.sortOrder === 'asc')}
          onClick={() => onChange({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' })}
        >
          {state.sortOrder === 'asc' ? '오름차순' : '내림차순'}
        </button>
      </div>
    </div>
  )
}


