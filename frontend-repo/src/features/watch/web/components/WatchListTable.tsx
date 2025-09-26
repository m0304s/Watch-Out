import { css } from '@emotion/react'
import type { Watch } from '@/features/watch/types'
import { useMemo, useState } from 'react'
import { SelectionCheckbox } from '@/components/common/SelectionCheckbox'
import { BottomActionBar } from '@/components/common/BottomActionBar'

interface WatchListTableProps {
  rows: Watch[]
  pageNum: number
  display: number
  totalItems: number
  onPageChange: (page: number) => void
  onRowClick?: (watchUuid: string) => void
  onDeleteWatches?: (watchUuids: string[]) => void
  onRentWatch?: (watchUuid: string) => void
  onReturnWatch?: (watchUuid: string) => void
}

const formatDate = (iso: string | null): string => {
  if (!iso) return '-'
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

const getStatusLabel = (status: Watch['status']): string => {
  switch (status) {
    case 'IN_USE':
      return '사용중'
    case 'AVAILABLE':
      return '사용가능'
    case 'UNAVAILABLE':
      return '사용불가'
    default:
      return status
  }
}

const getStatusColor = (status: Watch['status']): string => {
  switch (status) {
    case 'IN_USE':
      return 'var(--color-red)'
    case 'AVAILABLE':
      return 'var(--color-green)'
    case 'UNAVAILABLE':
      return 'var(--color-gray-500)'
    default:
      return 'var(--color-gray-500)'
  }
}

export const WatchListTable = ({
  rows,
  pageNum,
  display,
  totalItems,
  onPageChange,
  onRowClick,
  onDeleteWatches,
  onRentWatch,
  onReturnWatch,
}: WatchListTableProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / display))
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const isAllSelected = useMemo(
    () => rows.length > 0 && rows.every((r) => selected[r.watchUuid]),
    [rows, selected],
  )
  const selectedCount = useMemo(
    () => rows.filter((r) => selected[r.watchUuid]).length,
    [rows, selected],
  )

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleAll = () => {
    if (isAllSelected) {
      const next = { ...selected }
      rows.forEach((r) => delete next[r.watchUuid])
      setSelected(next)
    } else {
      const next = { ...selected }
      rows.forEach((r) => (next[r.watchUuid] = true))
      setSelected(next)
    }
  }
  const handleDelete = () => {
    if (!onDeleteWatches) return
    const ids = rows
      .filter((r) => selected[r.watchUuid])
      .map((r) => r.watchUuid)
    if (ids.length > 0) onDeleteWatches(ids)
  }
  const handleClearSelection = () => setSelected({})

  return (
    <div css={styles.container}>
      <table css={styles.table}>
        <thead>
          <tr>
            {onDeleteWatches && (
              <th css={styles.thCheckbox}>
                <SelectionCheckbox
                  checked={isAllSelected}
                  onToggle={toggleAll}
                  aria-label="전체 선택"
                />
              </th>
            )}
            <th css={styles.th}>워치 ID</th>
            <th css={styles.th}>사용자명</th>
            <th css={styles.th}>상태</th>
            <th css={styles.th}>대여일시</th>
            <th css={styles.thAction}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((watch, index) => (
            <tr
              key={`${watch.watchUuid}-${index}`}
              css={onRowClick ? styles.clickableRow : undefined}
              onClick={() => onRowClick?.(watch.watchUuid)}
            >
              {onDeleteWatches && (
                <td css={styles.tdCheckbox}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <SelectionCheckbox
                      checked={!!selected[watch.watchUuid]}
                      onToggle={() => toggle(watch.watchUuid)}
                      aria-label={`select watch ${watch.watchId}`}
                    />
                  </div>
                </td>
              )}
              <td css={styles.td}>{watch.watchId}</td>
              <td css={styles.td}>{watch.userName || '-'}</td>
              <td css={styles.td}>
                <span css={styles.statusBadge(getStatusColor(watch.status))}>
                  {getStatusLabel(watch.status)}
                </span>
              </td>
              <td css={styles.td}>{formatDate(watch.rentedAt)}</td>
              <td css={styles.tdAction} onClick={(e) => e.stopPropagation()}>
                <div css={styles.actionGroup}>
                  {watch.status === 'AVAILABLE' && (
                    <button
                      type="button"
                      css={styles.rentBtn}
                      onClick={() => onRentWatch?.(watch.watchUuid)}
                    >
                      대여
                    </button>
                  )}
                  {watch.status === 'IN_USE' && (
                    <button
                      type="button"
                      css={styles.returnBtn}
                      onClick={() => onReturnWatch?.(watch.watchUuid)}
                    >
                      반납
                    </button>
                  )}
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
          {selectedCount > 0 && onDeleteWatches && (
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
              type="button"
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
              type="button"
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
  thCheckbox: css`
    width: 44px;
    padding: 8px 12px;
    background-color: var(--color-gray-100);
  `,
  td: css`
    padding: 12px 16px;
    border-top: 1px solid var(--color-gray-200);
    font-size: 14px;
    color: var(--color-gray-800);
  `,
  tdCheckbox: css`
    padding: 8px 12px;
    border-top: 1px solid var(--color-gray-200);
    width: 44px;
  `,
  thAction: css`
    width: 160px;
    padding: 12px 16px;
    background-color: var(--color-gray-100);
  `,
  tdAction: css`
    padding: 8px 16px;
    border-top: 1px solid var(--color-gray-200);
  `,
  actionGroup: css`
    display: flex;
    gap: 8px;
  `,
  baseBtn: css`
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid var(--color-gray-300);
    background-color: var(--color-bg-white);
    color: var(--color-gray-800);
    font-size: 12px;
    cursor: pointer;
  `,
  rentBtn: css`
    padding: 6px 10px;
    border-radius: 6px;
    border: none;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    font-size: 12px;
    cursor: pointer;
  `,
  returnBtn: css`
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid var(--color-gray-400);
    background-color: var(--color-gray-100);
    color: var(--color-gray-800);
    font-size: 12px;
    cursor: pointer;
  `,
  statusBadge: (color: string) => css`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-family: 'PretendardMedium', sans-serif;
    background-color: ${color}20;
    color: ${color};
    border: 1px solid ${color}40;
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
  paginationContainer: css`
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 200px;
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
  pageInfo: css`
    font-family: 'PretendardRegular', sans-serif;
    color: var(--color-gray-600);
    font-size: 14px;
    margin: 0 8px;
  `,
  clickableRow: css`
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
      background-color: var(--color-gray-50);
    }
  `,
}
