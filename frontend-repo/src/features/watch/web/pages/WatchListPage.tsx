import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import type { Watch } from '@/features/watch/types'
import { WatchListTable } from '@/features/watch/web/components/WatchListTable'
import { WatchFormModal } from '@/features/watch/web/components/WatchFormModal'
import {
  deleteWatch,
  getWatchList,
  rentWatch,
  returnWatch,
} from '@/features/watch/api/watch'
import { WatchDetailModal } from '../components/WatchDetailModal'
import { useUserRole } from '@/stores/authStore'
import { UserSelectModal } from '@/features/watch/web/components/UserSelectModal'
import type { Employee } from '@/features/worker/types'
import { useToast } from '@/hooks/useToast'

const DISPLAY = 10

export const WatchListPage = () => {
  const userRole = useUserRole()
  const [pageNum, setPageNum] = useState<number>(0)
  const [rows, setRows] = useState<Watch[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [detailTargetUuid, setDetailTargetUuid] = useState<string | null>(null)
  const [rentTargetUuid, setRentTargetUuid] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const toast = useToast()

  // 권한 가드: ADMIN만 접근 허용
  if (userRole !== 'ADMIN') {
    return (
      <div css={guardStyles.container}>
        <div css={guardStyles.card}>권한이 없습니다</div>
      </div>
    )
  }

  // 중복된 워치 데이터 제거 함수
  const removeDuplicateWatches = (watches: Watch[]): Watch[] => {
    const seen = new Set<string>()
    return watches.filter((watch) => {
      if (seen.has(watch.watchUuid)) {
        console.warn(`중복된 워치 UUID 발견: ${watch.watchUuid}`)
        return false
      }
      seen.add(watch.watchUuid)
      return true
    })
  }

  const fetchWatches = async (page: number = pageNum) => {
    try {
      setLoading(true)
      setError(null)
      const response = await getWatchList({
        pageNum: page,
        display: DISPLAY,
      })
      // 중복 제거 후 데이터 설정
      const uniqueWatches = removeDuplicateWatches(response.data)
      setRows(uniqueWatches)
      setTotalItems(response.pagination.totalItems)
    } catch (err) {
      console.error('워치 목록 조회 실패:', err)
      setError('워치 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    void fetchWatches(0)
  }, [])

  const handlePageChange = (nextPage: number) => {
    setPageNum(nextPage)
    void fetchWatches(nextPage)
  }

  const handleCreateWatch = () => {
    setIsFormModalOpen(true)
  }

  const handleFormSuccess = async () => {
    // 워치 등록 성공 후 목록 새로고침
    await fetchWatches(pageNum)
  }

  const handleFormModalClose = () => {
    setIsFormModalOpen(false)
  }

  const handleRowClick = (watchUuid: string) => {
    setDetailTargetUuid(watchUuid)
  }

  const handleDetailClose = () => {
    setDetailTargetUuid(null)
  }

  const handleDeleteWatches = async (uuids: string[]) => {
    const confirmed = window.confirm(
      `정말 삭제하시겠습니까?\n삭제된 워치는 복구할 수 없습니다.`,
    )

    if (!confirmed) return

    try {
      await Promise.all(uuids.map((id) => deleteWatch(id)))
      await fetchWatches(pageNum)
    } catch (err) {
      console.error('워치 삭제 실패:', err)
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 대여하기 버튼 핸들러
  const handleRentWatch = (watchUuid: string) => {
    setRentTargetUuid(watchUuid)
  }

  // 반납 버튼 핸들러
  const handleReturnWatch = async (watchUuid: string) => {
    await onReturn(watchUuid)
  }

  const onUserSelected = async (user: Employee) => {
    if (!rentTargetUuid) return
    try {
      setActionLoading(true)
      await rentWatch(rentTargetUuid, { userUuid: user.userUuid })
      toast.success('워치를 대여했습니다')
      setRentTargetUuid(null)
      await fetchWatches(pageNum)
    } catch (err) {
      console.error('워치 대여 실패:', err)
      toast.error('워치 대여에 실패했습니다')
    } finally {
      setActionLoading(false)
    }
  }

  const onReturn = async (watchUuid: string) => {
    try {
      setActionLoading(true)
      await returnWatch(watchUuid)
      toast.success('워치를 반납했습니다')
      await fetchWatches(pageNum)
    } catch (err) {
      console.error('워치 반납 실패:', err)
      toast.error('워치 반납에 실패했습니다')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div css={pageStyles.container}>
        <div css={pageStyles.loading}>
          <div css={pageStyles.spinner} />
          <span>워치 목록을 불러오는 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div css={pageStyles.container}>
        <div css={pageStyles.error}>
          <span>{error}</span>
          <button
            css={pageStyles.retryBtn}
            onClick={() => void fetchWatches(pageNum)}
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div css={pageStyles.container}>
      <div css={pageStyles.header}>
        <h1 css={pageStyles.title}>워치 관리</h1>
        <button
          type="button"
          css={pageStyles.primaryBtn}
          onClick={handleCreateWatch}
        >
          워치 등록
        </button>
      </div>

      <WatchListTable
        rows={rows}
        pageNum={pageNum}
        display={DISPLAY}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        onDeleteWatches={handleDeleteWatches}
        onRentWatch={handleRentWatch}
        onReturnWatch={handleReturnWatch}
      />

      {/* 워치 등록 모달 */}
      <WatchFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        onSuccess={handleFormSuccess}
      />

      {/* 워치 상세 모달 */}
      <WatchDetailModal
        isOpen={!!detailTargetUuid}
        watchUuid={detailTargetUuid}
        onClose={handleDetailClose}
        onUpdated={() => void fetchWatches(pageNum)}
      />

      {/* 사용자 선택 모달 */}
      <UserSelectModal
        isOpen={!!rentTargetUuid}
        onClose={() => {
          if (actionLoading) return
          setRentTargetUuid(null)
        }}
        onSelect={onUserSelected}
      />
    </div>
  )
}

const guardStyles = {
  container: css`
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  `,
  card: css`
    background: var(--color-bg-white);
    color: var(--color-gray-800);
    border: 1px solid var(--color-gray-300);
    border-radius: 12px;
    padding: 24px 32px;
    font-family: 'PretendardSemiBold', sans-serif;
  `,
}

const pageStyles = {
  container: css`
    padding: 24px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    min-height: 100vh;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  title: css`
    font-size: 24px;
    font-family: 'PretendardBold', sans-serif;
    color: var(--color-gray-900);
    margin: 0;
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
  `,
  loading: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px;
    color: var(--color-gray-600);
  `,
  spinner: css`
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-gray-200);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
  error: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px;
    color: var(--color-red);
    text-align: center;
  `,
  retryBtn: css`
    padding: 8px 16px;
    border-radius: 8px;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-primary-dark);
    }
  `,
}
