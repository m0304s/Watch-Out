import { css } from '@emotion/react'
import { MdOutlineCheckBoxOutlineBlank } from 'react-icons/md'
import { IoCheckbox } from 'react-icons/io5'
import type { Employee } from '@/features/worker/types'

interface SelectedWorkerTableProps {
  rows: Employee[]
  pageNum: number
  display: number
  totalItems: number
  onPageChange: (page: number) => void
}

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export const SelectedWorkerTable = ({
  rows,
  pageNum,
  display,
  totalItems,
  onPageChange,
}: SelectedWorkerTableProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / display))

  return (
    <div css={styles.container}>
      <table css={styles.table}>
        <thead>
          <tr>
            <th css={styles.th}>이름</th>
            <th css={styles.th}>사번</th>
            <th css={styles.th}>구역</th>
            <th css={styles.th}>교육상태</th>
            <th css={styles.th}>최근 출입시간</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.userUuid}>
              <td css={styles.td}>{r.userName}</td>
              <td css={styles.td}>{r.userId}</td>
              <td css={styles.td}>{r.areaName}</td>
              <td css={styles.td}>
                <div css={styles.checkboxContainer}>
                  {r.trainingStatus === 'COMPLETED' ? (
                    <IoCheckbox css={styles.checkboxCompleted} />
                  ) : (
                    <MdOutlineCheckBoxOutlineBlank css={styles.checkboxEmpty} />
                  )}
                </div>
              </td>
              <td css={styles.td}>{formatDate(r.lastEntryTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div css={styles.footer}>
        <span>총 {totalItems}명</span>
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
  badge: (status: Employee['trainingStatus']) => css`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 12px;
    ${status === 'COMPLETED' &&
    css`
      background-color: var(--color-green);
      color: var(--color-text-white);
    `}
    ${status === 'EXPIRED' &&
    css`
      background-color: var(--color-red);
      color: var(--color-text-white);
    `}
  `,
  checkboxContainer: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 15px;
  `,
  checkboxCompleted: css`
    color: var(--color-primary);
    font-size: 18px;
  `,
  checkboxEmpty: css`
    color: var(--color-gray-400);
    font-size: 18px;
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
