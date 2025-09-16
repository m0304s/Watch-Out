import { css } from '@emotion/react'
import { useMemo, useState } from 'react'
import type { AreaItem } from '@/features/cctv/types'
import { SelectionCheckbox } from '@/components/common/SelectionCheckbox'

interface AreaTableProps {
  rows: AreaItem[]
  pageNum: number
  display: number
  totalItems: number
  onPageChange: (page: number) => void
}

export const AreaTable = ({
  rows,
  pageNum,
  display,
  totalItems,
  onPageChange,
}: AreaTableProps) => {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / display)),
    [totalItems, display],
  )
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div css={styles.container}>
      <table css={styles.table}>
        <thead>
          <tr>
            <th css={styles.th} />
            <th css={styles.th}>구역</th>
            <th css={styles.th}>별칭</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.areaUuid}>
              <td css={styles.tdCheckbox}>
                <SelectionCheckbox
                  checked={!!selected[r.areaUuid]}
                  onToggle={() => toggle(r.areaUuid)}
                  aria-label={`select ${r.areaName}`}
                />
              </td>
              <td css={styles.td}>{r.areaName}</td>
              <td css={styles.td}>{r.areaAlias}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div css={styles.footer}>
        <span>총 {totalItems}개</span>
        <div>
          <button
            css={styles.pagerBtn}
            onClick={() => onPageChange(pageNum - 1)}
            disabled={pageNum <= 0}
          >
            이전
          </button>
          <span
            css={css`
              margin: 0 8px;
            `}
          >
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
  tdCheckbox: css`
    padding: 8px 12px;
    border-top: 1px solid var(--color-gray-200);
    width: 44px;
  `,
  footer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--color-gray-50);
  `,
  pagerBtn: css`
    padding: 8px 12px;
    border-radius: 8px;
    background-color: var(--color-gray-100);
    border: 1px solid var(--color-gray-300);
    color: var(--color-gray-800);
    font-size: 13px;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
}
