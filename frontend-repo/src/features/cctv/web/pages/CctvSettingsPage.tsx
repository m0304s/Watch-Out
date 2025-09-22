import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import { useUserRole, useAreaUuid } from '@/stores/authStore'
import { getAreas } from '@/features/cctv/api/areaApi'
import { getCctvs, deleteCctv } from '@/features/cctv/api/cctvApi'
import type {
  AreaItem,
  CctvItem,
  PaginatedResponse,
} from '@/features/cctv/types'
import { CctvFilters } from '@/features/cctv/web/components/CctvFilters'
import { CctvTable } from '@/features/cctv/web/components/CctvTable'
import { CctvFormModal } from '@/features/cctv/web/components/CctvFormModal'

const DISPLAY = 10

export const CctvSettingsPage = () => {
  const role = useUserRole()
  const userAreaUuid = useAreaUuid()

  // 권한 가드: ADMIN 또는 AREA_ADMIN 접근 허용
  if (role !== 'ADMIN' && role !== 'AREA_ADMIN') {
    return (
      <div css={guardStyles.container}>
        <div css={guardStyles.card}>권한이 없습니다</div>
      </div>
    )
  }

  const [areas, setAreas] = useState<AreaItem[]>([])
  // AREA_ADMIN인 경우 본인 담당 구역으로 초기화, ADMIN인 경우 빈 문자열
  const [selectedAreaUuid, setSelectedAreaUuid] = useState<string>(
    role === 'AREA_ADMIN' ? userAreaUuid || '' : '',
  )
  const [search, setSearch] = useState<string>('')
  const [pageNum, setPageNum] = useState<number>(0)
  const [rows, setRows] = useState<CctvItem[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [editingCctv, setEditingCctv] = useState<CctvItem | null>(null)

  const fetchAreas = async () => {
    const res = await getAreas({ pageNum: 0, display: 1000, search: '' })
    setAreas(res.data)
  }

  const fetchCctvs = async (opts?: { page?: number; search?: string }) => {
    const page = opts?.page ?? pageNum
    const s = opts?.search ?? search.trim()
    const res: PaginatedResponse<CctvItem> = await getCctvs({
      pageNum: page,
      display: DISPLAY,
      areaUuid: selectedAreaUuid || undefined,
      search: s,
    })
    setRows(res.data)
    setTotalItems(res.pagination.totalItems)
  }

  useEffect(() => {
    const init = async () => {
      await fetchAreas()
      await fetchCctvs({ page: 0 })
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPageNum(0)
    void fetchCctvs({ page: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaUuid])

  const handleSearch = () => {
    setPageNum(0)
    void fetchCctvs({ page: 0, search })
  }

  const handlePageChange = (next: number) => {
    setPageNum(next)
    void fetchCctvs({ page: next })
  }

  const handleCreateCctv = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = () => {
    // CCTV 생성 성공 시 목록 새로고침
    void fetchCctvs({ page: 0 })
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleDeleteCctvs = async (cctvUuids: string[]) => {
    const confirmed = window.confirm(
      `선택한 ${cctvUuids.length}개의 CCTV를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    )

    if (!confirmed) return

    try {
      // 각 CCTV를 순차적으로 삭제
      for (const cctvUuid of cctvUuids) {
        await deleteCctv(cctvUuid)
      }

      // 삭제 완료 후 목록 새로고침
      await fetchCctvs({ page: pageNum })

      // 성공 메시지 표시
      alert('선택한 CCTV가 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('CCTV 삭제 중 오류 발생:', error)
      alert('CCTV 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleEditCctv = (cctv: CctvItem) => {
    setEditingCctv(cctv)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = async () => {
    // CCTV 수정 후 목록 새로고침
    await fetchCctvs({ page: pageNum })
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingCctv(null)
  }

  return (
    <div css={pageStyles.container}>
      <CctvFilters
        areas={areas}
        selectedAreaUuid={selectedAreaUuid}
        onChangeArea={setSelectedAreaUuid}
        search={search}
        onChangeSearch={setSearch}
        onSearch={handleSearch}
        userRole={role}
        onCreateCctv={handleCreateCctv}
      />

      <CctvTable
        rows={rows}
        pageNum={pageNum}
        display={DISPLAY}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onDeleteCctvs={handleDeleteCctvs}
        onEditCctv={handleEditCctv}
      />

      <CctvFormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCreateSuccess}
      />

      {/* CCTV 수정 모달 */}
      <CctvFormModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
        editingCctv={editingCctv}
      />
    </div>
  )
}

const pageStyles = {
  container: css`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
}

const guardStyles = {
  container: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60vh;
  `,
  card: css`
    background-color: var(--color-bg-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 24px 32px;
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-800);
  `,
}
