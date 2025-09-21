import { useEffect, useMemo, useState } from 'react'
import { css } from '@emotion/react'
import { DetailModal } from '@/components/common/Modal/DetailModal'
import { getWatchDetail, patchWatch } from '@/features/watch/api/watch'
import type {
  GetWatchDetailParams,
  WatchDetail,
  WatchStatus,
} from '@/features/watch/types'

interface WatchDetailModalProps {
  isOpen: boolean
  watchUuid: string | null
  onClose: () => void
  onUpdated?: () => void
}

export const WatchDetailModal = ({
  isOpen,
  watchUuid,
  onClose,
  onUpdated,
}: WatchDetailModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<WatchDetail | null>(null)
  const [pageNum, setPageNum] = useState<number>(0)
  const [display] = useState<number>(10)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [editData, setEditData] = useState<{
    modelName: string
    status: WatchStatus
    note: string
  } | null>(null)

  const getStatusLabel = (status: WatchStatus): string => {
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

  const canPaginate = useMemo(
    () => detail?.history.pagination ?? null,
    [detail],
  )

  const fetchDetail = async (params: GetWatchDetailParams = {}) => {
    if (!watchUuid) return
    try {
      setLoading(true)
      setError(null)
      const res = await getWatchDetail(watchUuid, params)
      setDetail(res)
    } catch (err) {
      console.error('워치 상세 조회 실패:', err)
      setError('상세 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && watchUuid) {
      void fetchDetail({ pageNum: 0, display })
      setPageNum(0)
      setIsEdit(false)
      setEditData(null)
    }
  }, [isOpen, watchUuid, display])

  const handleRetry = () => {
    void fetchDetail({ pageNum, display })
  }

  const startEdit = () => {
    if (!detail) return
    setIsEdit(true)
    setEditData({
      modelName: detail.modelName,
      status: detail.status,
      note: detail.note,
    })
  }

  const cancelEdit = () => {
    setIsEdit(false)
    setEditData(null)
  }

  const handleChange =
    (field: 'modelName' | 'status' | 'note') =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setEditData((prev) =>
        prev ? { ...prev, [field]: e.target.value } : prev,
      )
    }

  const handleSave = async () => {
    if (!watchUuid || !editData) return
    try {
      setLoading(true)
      await patchWatch(watchUuid, {
        modelName: editData.modelName,
        status: editData.status,
        note: editData.note,
      })
      setIsEdit(false)
      setEditData(null)
      await fetchDetail({ pageNum, display })
      onUpdated?.()
    } catch (err) {
      console.error('워치 수정 실패:', err)
      setError('수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrev = () => {
    if (!canPaginate || canPaginate.first) return
    const next = Math.max(0, pageNum - 1)
    setPageNum(next)
    void fetchDetail({ pageNum: next, display })
  }

  const handleNext = () => {
    if (!canPaginate || canPaginate.last) return
    const next = pageNum + 1
    setPageNum(next)
    void fetchDetail({ pageNum: next, display })
  }

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="워치 상세"
      loading={loading}
      error={error}
      onRetry={handleRetry}
    >
      {!detail ? null : (
        <div css={styles.container}>
          <section css={styles.section}>
            <div css={styles.row}>
              <span css={styles.label}>워치 ID</span>
              <span css={styles.value}>{detail.watchId}</span>
            </div>
            <div css={styles.row}>
              <span css={styles.label}>모델명</span>
              {isEdit ? (
                <input
                  css={styles.input}
                  value={editData?.modelName ?? ''}
                  onChange={handleChange('modelName')}
                />
              ) : (
                <span css={styles.value}>{detail.modelName}</span>
              )}
            </div>
            <div css={styles.row}>
              <span css={styles.label}>상태</span>
              {isEdit ? (
                <select
                  css={styles.select}
                  value={editData?.status ?? 'AVAILABLE'}
                  onChange={handleChange('status')}
                >
                  <option value="AVAILABLE">사용가능</option>
                  <option value="IN_USE">사용중</option>
                  <option value="UNAVAILABLE">사용불가</option>
                </select>
              ) : (
                <span css={styles.value}>{getStatusLabel(detail.status)}</span>
              )}
            </div>
            <div css={styles.row}>
              <span css={styles.label}>비고</span>
              {isEdit ? (
                <textarea
                  css={styles.textarea}
                  value={editData?.note ?? ''}
                  onChange={handleChange('note')}
                  rows={3}
                />
              ) : (
                <span css={styles.value}>{detail.note || '-'}</span>
              )}
            </div>

            <div css={styles.actions}>
              {isEdit ? (
                <>
                  <button
                    type="button"
                    css={styles.secondaryBtn}
                    onClick={cancelEdit}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    css={styles.primaryBtn}
                    onClick={handleSave}
                  >
                    저장
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  css={styles.primaryBtn}
                  onClick={startEdit}
                >
                  수정
                </button>
              )}
            </div>
          </section>

          <section css={styles.section}>
            <h3 css={styles.sectionTitle}>사용 기록</h3>
            <table css={styles.table}>
              <thead>
                <tr>
                  <th css={styles.th}>사용자명</th>
                  <th css={styles.th}>대여일시</th>
                </tr>
              </thead>
              <tbody>
                {detail.history.data.length === 0 ? (
                  <tr>
                    <td css={styles.td} colSpan={2}>
                      기록이 없습니다.
                    </td>
                  </tr>
                ) : (
                  detail.history.data.map((h) => (
                    <tr key={`${h.userUuid}-${h.rentedAt}`}>
                      <td css={styles.td}>{h.userName}</td>
                      <td css={styles.td}>
                        {new Date(h.rentedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {canPaginate && (
              <div css={styles.pagination}>
                <button
                  css={styles.pagerBtn}
                  onClick={handlePrev}
                  disabled={canPaginate.first}
                >
                  이전
                </button>
                <span css={styles.pageInfo}>
                  {canPaginate.pageNum + 1} / {canPaginate.totalPages}
                </span>
                <button
                  css={styles.pagerBtn}
                  onClick={handleNext}
                  disabled={canPaginate.last}
                >
                  다음
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </DetailModal>
  )
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  section: css`
    padding: 0 20px 20px;
  `,
  sectionTitle: css`
    margin: 0 0 12px;
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-900);
    font-size: 16px;
  `,
  row: css`
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 12px;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-gray-100);
  `,
  label: css`
    color: var(--color-gray-600);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
  `,
  value: css`
    color: var(--color-gray-900);
    font-size: 14px;
  `,
  input: css`
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
  select: css`
    padding: 10px 12px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;
    background: var(--color-bg-white);
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
  `,
  textarea: css`
    padding: 10px 12px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;
    resize: vertical;
    min-height: 80px;
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
  `,
  actions: css`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  `,
  primaryBtn: css`
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: var(--color-primary);
    color: var(--color-text-white);
    font-family: 'PretendardSemiBold', sans-serif;
    cursor: pointer;
  `,
  secondaryBtn: css`
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--color-gray-300);
    background: var(--color-bg-white);
    color: var(--color-gray-800);
    font-family: 'PretendardSemiBold', sans-serif;
    cursor: pointer;
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
    background: var(--color-bg-white);
    border: 1px solid var(--color-gray-200);
    border-radius: 8px;
    overflow: hidden;
  `,
  th: css`
    text-align: left;
    padding: 10px 12px;
    background: var(--color-gray-100);
    color: var(--color-gray-800);
    font-size: 13px;
    font-family: 'PretendardSemiBold', sans-serif;
  `,
  td: css`
    padding: 10px 12px;
    border-top: 1px solid var(--color-gray-200);
    font-size: 13px;
  `,
  pagination: css`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  `,
  pagerBtn: css`
    padding: 6px 10px;
    border-radius: 6px;
    background: var(--color-gray-100);
    border: 1px solid var(--color-gray-300);
    cursor: pointer;
  `,
  pageInfo: css`
    color: var(--color-gray-600);
    font-size: 13px;
  `,
}
