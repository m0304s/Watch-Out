import { css } from '@emotion/react'
import { useEffect, useMemo, useState } from 'react'
import type {
  Employee,
  WorkerFilterState,
  TrainingStatus,
  AreaOption,
} from '@/features/worker/types'
import { SelectedWorkerFilters } from '@/features/worker/web/components/SelectedWorkerFilters'
import { SelectedWorkerTable } from '@/features/worker/web/components/SelectedWorkerTable'
import { WorkerDetailModal } from '@/features/worker/web/components/WorkerDetailModal'
import { getAreas, getEmployees, updateUserRole } from '@/features/worker/api/workerApi'
import { useUserRole, useAreaUuid } from '@/stores/authStore'
import type { UserRole } from '@/features/worker/types'

const DISPLAY = 10

const defaultFilterState: WorkerFilterState = {
  search: '',
  companies: [],
  areas: [], // 단일 선택이지만 컴포넌트 인터페이스 유지
  statuses: [], // 단일 선택이지만 컴포넌트 인터페이스 유지
  sortKey: 'lastEntryTime',
  sortOrder: 'desc',
}

const unique = (arr: string[]): string[] => Array.from(new Set(arr))

export const SelectedWorkersPage = () => {
  const [filters, setFilters] = useState<WorkerFilterState>(defaultFilterState)
  const [pageNum, setPageNum] = useState<number>(0)
  const [rows, setRows] = useState<Employee[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)
  const [areas, setAreas] = useState<AreaOption[]>([])
  const [selectedWorkerUuid, setSelectedWorkerUuid] = useState<string | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 사용자 권한 확인
  const userRole = useUserRole()
  const userAreaUuid = useAreaUuid()

  // areaAlias 또는 areaName으로 표시용 라벨 구성
  const areaLabels = useMemo(() => {
    const labels = areas
      .map((area) => area.areaAlias ?? area.areaName)
      .filter(Boolean) as string[]
    return unique(['전체', ...labels])
  }, [areas])

  // area 라벨 -> areaUuid 매핑
  const labelToUuid = useMemo(() => {
    const map = new Map<string, string>()
    map.set('전체', '')
    for (const area of areas) {
      map.set(area.areaAlias ?? area.areaName, area.areaUuid)
    }
    return map
  }, [areas])

  const selectedAreaLabel = filters.areas[0] ?? '전체'
  const selectedStatus: TrainingStatus | '' =
    (filters.statuses[0] as TrainingStatus | undefined) ?? ''
  
  // AREA_ADMIN인 경우 본인의 담당구역을 자동으로 설정
  const selectedAreaUuid = useMemo(() => {
    if (userRole === 'AREA_ADMIN' && userAreaUuid) {
      return userAreaUuid
    }
    return labelToUuid.get(selectedAreaLabel) ?? ''
  }, [userRole, userAreaUuid, selectedAreaLabel, labelToUuid])

  const fetchAreas = async () => {
    const list = await getAreas()
    // 서버 응답 그대로 보관
    setAreas(list)
  }

  const fetchUsers = async (opts?: { search?: string; page?: number }) => {
    const page = opts?.page ?? pageNum
    const search = opts?.search ?? filters.search.trim()
    const res = await getEmployees({
      areaUuid: selectedAreaUuid,
      trainingStatus: selectedStatus || undefined,
      search,
      pageNum: page,
      display: DISPLAY,
      // AREA_ADMIN인 경우 userRole을 WORKER로 기본 설정
      userRole: userRole === 'AREA_ADMIN' ? 'WORKER' : undefined,
    })
    setRows(res.data)
    setTotalItems(res.pagination.totalItems)
  }

  // 초기 구역 로드 및 첫 목록
  useEffect(() => {
    const init = async () => {
      await fetchAreas()
      await fetchUsers({ page: 0 })
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 필터 변경 시 0페이지부터 재조회
  useEffect(() => {
    setPageNum(0)
    void fetchUsers({ page: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaUuid, selectedStatus])

  const handleChangeFilters = (next: Partial<WorkerFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const handleSearch = () => {
    setPageNum(0)
    void fetchUsers({ search: filters.search.trim(), page: 0 })
  }

  const handlePageChange = (nextPage: number) => {
    setPageNum(nextPage)
    void fetchUsers({ page: nextPage })
  }

  const handleWorkerClick = (userUuid: string) => {
    setSelectedWorkerUuid(userUuid)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedWorkerUuid(null)
  }

  const handleRoleChange = async (userUuid: string, newRole: UserRole) => {
    try {
      await updateUserRole({ userUuid, newRole })
      // 성공 시 목록 새로고침
      await fetchUsers({ page: pageNum })
    } catch (error) {
      console.error('직책 변경 실패:', error)
    }
  }

  return (
    <div css={pageStyles.container}>
      {/* ADMIN 또는 AREA_ADMIN인 경우에만 필터링 컴포넌트 표시 */}
      {(userRole === 'ADMIN' || userRole === 'AREA_ADMIN') && (
        <SelectedWorkerFilters
          state={filters}
          onChange={handleChangeFilters}
          areaOptions={areaLabels}
          onSearch={handleSearch}
          showAreaFilter={userRole === 'ADMIN'}
        />
      )}

      <SelectedWorkerTable
        rows={rows}
        pageNum={pageNum}
        display={DISPLAY}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onRowClick={handleWorkerClick}
        onRoleChange={handleRoleChange}
        canChangeRole={userRole === 'ADMIN'}
      />

      {/* 작업자 상세 모달 */}
      <WorkerDetailModal
        userUuid={selectedWorkerUuid}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  )
}

const pageStyles = {
  container: css`
    padding: 24px;
    display: grid;
    grid-template-columns: 1fr; /* 좌/우 사이드바 제외, 내부 컨텐츠만 */
    gap: 16px;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  title: css`
    font-size: 20px;
    color: var(--color-gray-900);
  `,
}
