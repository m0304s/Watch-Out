import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import { useUserRole } from '@/stores/authStore'
import { AreaTable } from '@/features/cctv/web/components/AreaTable'
import { AreaFormModal } from '@/features/cctv/web/components/AreaFormModal'
import { AreaDetailModal } from '@/features/cctv/web/components/AreaDetailModal'
import { getAreas, deleteArea } from '@/features/cctv/api/areaApi'
import type { AreaItem, PaginatedResponse } from '@/features/cctv/types'
import { useToast } from '@/hooks/useToast'

const DISPLAY = 10

export const AreaManagementPage = () => {
  const toast = useToast()
  const role = useUserRole()

  // 권한 가드: ADMIN만 접근 허용
  if (role !== 'ADMIN') {
    return (
      <div css={guardStyles.container}>
        <div css={guardStyles.card}>권한이 없습니다</div>
      </div>
    )
  }

  const [search, setSearch] = useState<string>('')
  const [pageNum, setPageNum] = useState<number>(0)
  const [rows, setRows] = useState<AreaItem[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [selectedAreaUuid, setSelectedAreaUuid] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null)

  const fetchList = async (opts?: { page?: number; search?: string }) => {
    const page = opts?.page ?? pageNum
    const s = opts?.search ?? search.trim()
    const res: PaginatedResponse<AreaItem> = await getAreas({
      pageNum: page,
      display: DISPLAY,
      search: s,
    })
    setRows(res.data)
    setTotalItems(res.pagination.totalItems)
  }

  useEffect(() => {
    void fetchList({ page: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    setPageNum(0)
    void fetchList({ page: 0, search })
  }

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePageChange = (next: number) => {
    setPageNum(next)
    void fetchList({ page: next })
  }

  const handleDeleteAreas = async (areaUuids: string[]) => {
    const confirmed = window.confirm(
      `선택한 ${areaUuids.length}개의 구역을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    )

    if (!confirmed) return

    try {
      // 각 구역을 순차적으로 삭제
      for (const areaUuid of areaUuids) {
        await deleteArea(areaUuid)
      }

      // 삭제 완료 후 목록 새로고침
      await fetchList({ page: pageNum })

      // 성공 메시지 표시
      toast.success('선택한 구역이 성공적으로 삭제되었습니다.')
    } catch (err) {
      console.error('구역 삭제 중 오류 발생:', err)
      toast.error('구역 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleManagerAssigned = async () => {
    // 담당자 지정 후 목록 새로고침
    await fetchList({ page: pageNum })
  }

  const handleCreateArea = () => {
    setEditingArea(null) // 생성 모드
    setIsFormModalOpen(true)
  }

  const handleFormSuccess = async () => {
    // 구역 생성/수정 후 목록 새로고침
    await fetchList({ page: pageNum })
  }

  const handleAreaClick = (areaUuid: string) => {
    setSelectedAreaUuid(areaUuid)
    setIsDetailModalOpen(true)
  }

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false)
    setSelectedAreaUuid(null)
  }

  const handleEditArea = (area: AreaItem) => {
    setEditingArea(area) // 수정 모드
    setIsFormModalOpen(true)
  }

  const handleFormModalClose = () => {
    setIsFormModalOpen(false)
    setEditingArea(null)
  }

  return (
    <div css={pageStyles.container}>
      <div css={pageStyles.toolbar}>
        <div css={pageStyles.searchGroup}>
          <span css={pageStyles.label}>검색</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="구역 이름으로 검색"
            css={pageStyles.input}
          />
          <button
            type="button"
            onClick={handleSearch}
            css={pageStyles.searchBtn}
          >
            검색
          </button>
        </div>
        <div>
          <button
            type="button"
            css={pageStyles.primaryBtn}
            onClick={handleCreateArea}
          >
            구역 등록
          </button>
        </div>
      </div>

      <AreaTable
        rows={rows}
        pageNum={pageNum}
        display={DISPLAY}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onDeleteAreas={handleDeleteAreas}
        onManagerAssigned={handleManagerAssigned}
        onRowClick={handleAreaClick}
        onEditArea={handleEditArea}
      />

      {/* 구역 생성/수정 모달 */}
      <AreaFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        onSuccess={handleFormSuccess}
        editingArea={editingArea}
      />

      {/* 구역 상세 정보 모달 */}
      {selectedAreaUuid && (
        <AreaDetailModal
          areaUuid={selectedAreaUuid}
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
        />
      )}
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
  label: css`
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-800);
    font-size: 14px;
    min-width: 64px;
  `,
  container: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  `,
  toolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-bg-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
  `,
  searchGroup: css`
    display: flex;
    align-items: center;
    gap: 8px;
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
  `,
}
