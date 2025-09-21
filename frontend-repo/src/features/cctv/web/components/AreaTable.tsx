import { css } from '@emotion/react'
import { useMemo, useState } from 'react'
import type { AreaItem } from '@/features/cctv/types'
import { SelectionCheckbox } from '@/components/common/SelectionCheckbox'
import { ManagerDropdown } from '@/features/cctv/web/components/ManagerDropdown'
import { BottomActionBar } from '@/components/common/BottomActionBar'

interface AreaTableProps {
  rows: AreaItem[]
  pageNum: number
  display: number
  totalItems: number
  onPageChange: (page: number) => void
  onDeleteAreas: (areaUuids: string[]) => void
  onManagerAssigned: () => void
  onRowClick?: (areaUuid: string) => void
  onEditArea?: (area: AreaItem) => void
}

export const AreaTable = ({
  rows,
  pageNum,
  display,
  totalItems,
  onPageChange,
  onDeleteAreas,
  onManagerAssigned,
  onRowClick,
  onEditArea,
}: AreaTableProps) => {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / display)),
    [totalItems, display],
  )
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  // 전체 선택/해제 상태 계산
  const isAllSelected = useMemo(() => {
    return rows.length > 0 && rows.every((row) => selected[row.areaUuid])
  }, [rows, selected])

  const selectedCount = useMemo(() => {
    return rows.filter((row) => selected[row.areaUuid]).length
  }, [rows, selected])

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleAll = () => {
    if (isAllSelected) {
      // 전체 해제
      const newSelected = { ...selected }
      rows.forEach((row) => {
        delete newSelected[row.areaUuid]
      })
      setSelected(newSelected)
    } else {
      // 전체 선택
      const newSelected = { ...selected }
      rows.forEach((row) => {
        newSelected[row.areaUuid] = true
      })
      setSelected(newSelected)
    }
  }

  const handleDelete = () => {
    const selectedAreaUuids = rows
      .filter((row) => selected[row.areaUuid])
      .map((row) => row.areaUuid)

    if (selectedAreaUuids.length > 0) {
      onDeleteAreas(selectedAreaUuids)
    }
  }

  const handleClearSelection = () => {
    setSelected({})
  }

  return (
    <div css={styles.container}>
      <table css={styles.table}>
        <thead>
          <tr>
            <th css={styles.th}>
              <SelectionCheckbox
                checked={isAllSelected}
                onToggle={toggleAll}
                aria-label="전체 선택"
              />
            </th>
            <th css={styles.th}>구역</th>
            <th css={styles.th}>별칭</th>
            <th css={styles.th}>담당자</th>
            <th css={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.areaUuid}
              css={onRowClick ? styles.clickableRow : undefined}
              onClick={() => onRowClick?.(r.areaUuid)}
            >
              <td css={styles.tdCheckbox}>
                <div onClick={(e) => e.stopPropagation()}>
                  <SelectionCheckbox
                    checked={!!selected[r.areaUuid]}
                    onToggle={() => toggle(r.areaUuid)}
                    aria-label={`select ${r.areaName}`}
                  />
                </div>
              </td>
              <td css={styles.td}>{r.areaName}</td>
              <td css={styles.td}>{r.areaAlias}</td>
              <td css={styles.td}>
                <div onClick={(e) => e.stopPropagation()}>
                  <ManagerDropdown
                    areaUuid={r.areaUuid}
                    currentManagerName={r.managerName}
                    onManagerAssigned={onManagerAssigned}
                  />
                </div>
              </td>
              <td css={styles.td}>
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    css={styles.editButton}
                    onClick={() => onEditArea?.(r)}
                    type="button"
                  >
                    수정
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div css={styles.footer}>
        <div css={styles.footerLeft}>
          <span css={styles.totalCount}>총 {totalItems}개</span>
        </div>

        <div css={styles.footerCenter}>
          {selectedCount > 0 && (
            <BottomActionBar
              selectedCount={selectedCount}
              onClearSelection={handleClearSelection}
              onDelete={handleDelete}
            />
          )}
        </div>

        <div css={styles.footerRight}>
          <div css={styles.paginationContainer}>
            <button
              css={styles.pagerBtn}
              onClick={() => onPageChange(pageNum - 1)}
              disabled={pageNum <= 0}
            >
              이전
            </button>
            <span css={styles.pageInfo}>
              {pageNum + 1} / {totalPages}
            </span>
            <button
              css={styles.pagerBtn}
              onClick={() => onPageChange(pageNum + 1)}
              disabled={pageNum >= totalPages - 1}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: css`
    background-color: var(--color-bg-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
  `,
  th: css`
    text-align: left;
    padding: 12px 16px;
    background-color: var(--color-gray-100);
    color: var(--color-gray-800);
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 14px;
  `,
  td: css`
    padding: 12px 16px;
    border-top: 1px solid var(--color-gray-200);
    font-size: 14px;
    color: var(--color-gray-800);
  `,
  clickableRow: css`
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-gray-50);
    }
  `,
  tdCheckbox: css`
    padding: 8px 12px;
    border-top: 1px solid var(--color-gray-200);
    width: 44px;
  `,
  managerName: css`
    color: var(--color-gray-600);
    font-size: 14px;
  `,
  footer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: var(--color-gray-50);
    border-top: 1px solid var(--color-gray-200);
  `,
  footerLeft: css`
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  `,
  footerCenter: css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  `,
  footerRight: css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    flex: 1;
  `,
  totalCount: css`
    font-family: 'PretendardRegular', sans-serif;
    color: var(--color-gray-600);
    font-size: 14px;
  `,
  selectedCount: css`
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-primary);
    font-size: 14px;
    background-color: var(--color-primary-light);
    padding: 4px 8px;
    border-radius: 6px;
  `,
  paginationContainer: css`
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 200px;
  `,
  paginationLeft: css`
    display: flex;
    align-items: center;
  `,
  paginationCenter: css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  `,
  paginationRight: css`
    display: flex;
    align-items: center;
  `,
  pageInfo: css`
    font-family: 'PretendardRegular', sans-serif;
    color: var(--color-gray-600);
    font-size: 14px;
    margin: 0 8px;
  `,
  pagerBtn: css`
    padding: 6px 12px;
    border-radius: 6px;
    background-color: var(--color-bg-white);
    border: 1px solid var(--color-gray-300);
    color: var(--color-gray-700);
    font-size: 13px;
    font-family: 'PretendardRegular', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-gray-100);
      border-color: var(--color-gray-400);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--color-gray-100);
    }
  `,
  editButton: css`
    padding: 6px 12px;
    border-radius: 6px;
    background-color: var(--color-white);
    border: 1px solid var(--color-gray-300);
    color: var(--color-text-black);
    font-size: 13px;
    font-family: 'PretendardSemiBold', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  `,
}
