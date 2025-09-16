import { useEffect, useMemo, useState } from 'react'
import { css } from '@emotion/react'
import type {
  Employee,
  WorkerFilterState,
  TrainingStatus,
  AreaOption,
} from '@/features/worker/types'
import { SelectedWorkerFilters } from '@/features/worker/web/components/SelectedWorkerFilters'
import { SelectedWorkerTable } from '@/features/worker/web/components/SelectedWorkerTable'
import { getAreas, getEmployees } from '@/features/worker/api/workerApi'
import { useUserRole } from '@/stores/authStore'

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

  // 사용자 권한 확인
  const userRole = useUserRole()

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
  const selectedAreaUuid = labelToUuid.get(selectedAreaLabel) ?? ''

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

  return (
    <div css={pageStyles.container}>
      {/* ADMIN인 경우에만 필터링 컴포넌트 표시 */}
      {userRole === 'ADMIN' && (
        <SelectedWorkerFilters
          state={filters}
          onChange={handleChangeFilters}
          areaOptions={areaLabels}
          onSearch={handleSearch}
        />
      )}

      <SelectedWorkerTable
        rows={rows}
        pageNum={pageNum}
        display={DISPLAY}
        totalItems={totalItems}
        onPageChange={handlePageChange}
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
