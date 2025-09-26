import { css } from '@emotion/react'
import type { AreaItem } from '@/features/cctv/types'

interface CctvFiltersProps {
  areas: Array<Pick<AreaItem, 'areaUuid' | 'areaAlias' | 'areaName'>>
  selectedAreaUuid: string
  onChangeArea: (areaUuid: string) => void
  search: string
  onChangeSearch: (value: string) => void
  onSearch: () => void
  userRole?: 'WORKER' | 'AREA_ADMIN' | 'ADMIN' | null
  onCreateCctv?: () => void
}

export const CctvFilters = ({
  areas,
  selectedAreaUuid,
  onChangeArea,
  search,
  onChangeSearch,
  onSearch,
  userRole,
  onCreateCctv,
}: CctvFiltersProps) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div css={styles.container}>
      {/* AREA_ADMIN이 아닌 경우에만 구역 필터링 표시 */}
      {userRole !== 'AREA_ADMIN' && (
        <div css={styles.areaFilter}>
          <span css={styles.label}>구역</span>
          <button
            css={styles.chip(selectedAreaUuid === '')}
            onClick={() => onChangeArea('')}
            type="button"
          >
            전체
          </button>
          {areas.map((area) => {
            const label = area.areaAlias || area.areaName
            return (
              <button
                key={area.areaUuid}
                css={styles.chip(selectedAreaUuid === area.areaUuid)}
                onClick={() => onChangeArea(area.areaUuid)}
                type="button"
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      <div css={styles.toolbar}>
        <div css={styles.searchGroup}>
          <span css={styles.label}>검색</span>
          <input
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="CCTV 이름 검색"
            css={styles.input}
          />
          <button type="button" onClick={onSearch} css={styles.searchBtn}>
            검색
          </button>
        </div>

        {/* ADMIN인 경우에만 생성 버튼 표시 */}
        {userRole === 'ADMIN' && onCreateCctv && (
          <div>
            <button
              type="button"
              onClick={onCreateCctv}
              css={styles.primaryBtn}
            >
              CCTV 등록
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: var(--color-bg-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
  `,
  areaFilter: css`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  `,
  toolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  searchGroup: css`
    display: flex;
    align-items: center;
    gap: 8px;
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
  searchBtn: css`
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    font-size: 14px;
    font-family: 'PretendardSemiBold', sans-serif;
    cursor: pointer;
  `,
  primaryBtn: css`
    padding: 10px 14px;
    border-radius: 8px;
    border: none;
    background: var(--color-primary);
    color: var(--color-text-white);
    font-size: 14px;
    font-family: 'PretendardSemiBold', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  `,
}
