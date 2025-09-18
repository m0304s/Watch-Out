import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import { getAreaDetail } from '@/features/cctv/api/areaApi'
import { DetailModal } from '@/components/common/Modal'
import type { AreaDetail } from '@/features/cctv/types'

interface AreaDetailModalProps {
  areaUuid: string
  isOpen: boolean
  onClose: () => void
}

export const AreaDetailModal = ({
  areaUuid,
  isOpen,
  onClose,
}: AreaDetailModalProps) => {
  const [areaDetail, setAreaDetail] = useState<AreaDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && areaUuid) {
      fetchAreaDetail()
    }
  }, [isOpen, areaUuid])

  const fetchAreaDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAreaDetail({ areaUuid })
      setAreaDetail(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '구역 정보를 불러오는데 실패했습니다.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="구역 상세 정보"
      loading={loading}
      error={error}
      onRetry={fetchAreaDetail}
    >
      {areaDetail && (
        <div css={modalStyles.detailContainer}>
          {/* 구역 기본 정보 섹션 */}
          <div css={modalStyles.profileSection}>
            <div css={modalStyles.profileInfo}>
              <h3 css={modalStyles.areaName}>{areaDetail.areaName}</h3>
              <p css={modalStyles.areaAlias}>별칭: {areaDetail.areaAlias}</p>
              <div css={modalStyles.badges}>
                <span css={modalStyles.managerBadge}>
                  담당자: {areaDetail.managerName}
                </span>
              </div>
            </div>
          </div>

          {/* 구역 근로자 목록 섹션 */}
          <div css={modalStyles.section}>
            <h4 css={modalStyles.sectionTitle}>
              구역 근로자 ({areaDetail.workers.pagination.totalItems}명)
            </h4>

            {areaDetail.workers.data.length > 0 ? (
              <div css={modalStyles.workersList}>
                {areaDetail.workers.data.map((worker) => (
                  <div key={worker.userUuid} css={modalStyles.workerItem}>
                    <div css={modalStyles.workerInfo}>
                      <span css={modalStyles.workerName}>
                        {worker.userName}
                      </span>
                      <span css={modalStyles.workerId}>
                        사번: {worker.userId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div css={modalStyles.emptyState}>
                <p css={modalStyles.emptyText}>등록된 근로자가 없습니다.</p>
              </div>
            )}

            {/* 페이지네이션 정보 */}
            {areaDetail.workers.pagination.totalPages > 1 && (
              <div css={modalStyles.paginationInfo}>
                <span css={modalStyles.paginationText}>
                  {areaDetail.workers.pagination.pageNum + 1} /{' '}
                  {areaDetail.workers.pagination.totalPages} 페이지
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </DetailModal>
  )
}

const modalStyles = {
  detailContainer: css`
    padding: 24px;
  `,
  profileSection: css`
    display: flex;
    gap: 20px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-gray-200);
  `,
  areaIcon: css`
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background-color: var(--color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `,
  areaIconText: css`
    font-family: 'PretendardBold', sans-serif;
    font-size: 24px;
    color: var(--color-primary);
  `,
  profileInfo: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  areaName: css`
    margin: 0;
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 20px;
    color: var(--color-gray-900);
  `,
  areaAlias: css`
    margin: 0;
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
    color: var(--color-gray-600);
  `,
  badges: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,
  managerBadge: css`
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-family: 'PretendardMedium', sans-serif;
    background-color: var(--color-primary-light);
    color: var(--color-primary);
  `,
  section: css`
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  `,
  sectionTitle: css`
    margin: 0 0 16px 0;
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 16px;
    color: var(--color-gray-900);
  `,
  workersList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  workerItem: css`
    padding: 16px;
    background-color: var(--color-gray-50);
    border-radius: 8px;
    border: 1px solid var(--color-gray-200);
  `,
  workerInfo: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  workerName: css`
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 14px;
    color: var(--color-gray-900);
  `,
  workerId: css`
    font-family: 'PretendardRegular', sans-serif;
    font-size: 12px;
    color: var(--color-gray-600);
  `,
  emptyState: css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background-color: var(--color-gray-50);
    border-radius: 8px;
    border: 1px solid var(--color-gray-200);
  `,
  emptyText: css`
    color: var(--color-gray-500);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
    text-align: center;
  `,
  paginationInfo: css`
    display: flex;
    justify-content: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-gray-200);
  `,
  paginationText: css`
    color: var(--color-gray-500);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 12px;
  `,
}
