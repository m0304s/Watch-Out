import { useMemo, useState } from 'react'
import { css } from '@emotion/react'
import type { Employee, PaginatedResponse, WorkerFilterState } from '@/features/worker/types'
import { SelectedWorkerFilters } from '@/features/worker/web/components/SelectedWorkerFilters'
import { SelectedWorkerTable } from '@/features/worker/web/components/SelectedWorkerTable'

// 더미 데이터 (API 연결 전)
const MOCK_DATA: PaginatedResponse<Employee> = {
  data: [
    {
      userUuid: '11b88068-4078-4a60-b798-e18faa8f4c2a',
      userId: '1234567',
      userName: '김안전',
      companyName: '건설안전 주식회사',
      areaName: 'A구역',
      trainingStatus: 'COMPLETED',
      lastEntryTime: '2025-09-07T08:55:12Z',
    },
    {
      userUuid: '22c99179-5189-5b71-c809-f29abb9g5d3b',
      userId: '7654321',
      userName: '박성실',
      companyName: '건설안전 주식회사',
      areaName: 'B구역',
      trainingStatus: 'EXPIRED',
      lastEntryTime: '2025-09-07T09:01:30Z',
    },
  ],
  pagination: {
    pageNum: 1,
    display: 10,
    totalItems: 2,
    totalPages: 1,
  },
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

const defaultFilterState: WorkerFilterState = {
  search: '',
  companies: [],
  areas: [],
  statuses: [],
  sortKey: 'lastEntryTime',
  sortOrder: 'desc',
}

const unique = (arr: string[]): string[] => Array.from(new Set(arr))

export const SelectedWorkersPage = () => {
  const [filters, setFilters] = useState<WorkerFilterState>(defaultFilterState)
  const [pageNum, setPageNum] = useState<number>(MOCK_DATA.pagination.pageNum)

  const companyOptions = useMemo(
    () => unique(MOCK_DATA.data.map((d) => d.companyName)),
    [],
  )
  const areaOptions = useMemo(
    () => unique(MOCK_DATA.data.map((d) => d.areaName)),
    [],
  )

  const handleChangeFilters = (next: Partial<WorkerFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }))
    setPageNum(1) // 필터 변경 시 1페이지로
  }

  const filteredSorted = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase()

    let rows = MOCK_DATA.data.filter((d) => {
      const matchesSearch = !searchLower
        || d.userName.toLowerCase().includes(searchLower)
        || d.userId.toLowerCase().includes(searchLower)
        || d.companyName.toLowerCase().includes(searchLower)

      const matchesCompany = filters.companies.length === 0
        || filters.companies.includes(d.companyName)

      const matchesArea = filters.areas.length === 0
        || filters.areas.includes(d.areaName)

      const matchesStatus = filters.statuses.length === 0
        || filters.statuses.includes(d.trainingStatus)

      return matchesSearch && matchesCompany && matchesArea && matchesStatus
    })

    rows = rows.sort((a, b) => {
      const dir = filters.sortOrder === 'asc' ? 1 : -1
      if (filters.sortKey === 'lastEntryTime') {
        return (new Date(a.lastEntryTime).getTime() - new Date(b.lastEntryTime).getTime()) * dir
      }
      return a.userName.localeCompare(b.userName) * dir
    })

    return rows
  }, [filters])

  const display = MOCK_DATA.pagination.display
  const totalItems = filteredSorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / display))
  const currentPage = Math.min(pageNum, totalPages)
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * display
    return filteredSorted.slice(start, start + display)
  }, [filteredSorted, currentPage])

  return (
    <div css={pageStyles.container}>
      <div css={pageStyles.header}>
        <h1 css={pageStyles.title}>선택한 작업자 목록</h1>
      </div>

      <SelectedWorkerFilters
        state={filters}
        onChange={handleChangeFilters}
        companyOptions={companyOptions}
        areaOptions={areaOptions}
      />

      <SelectedWorkerTable
        rows={paginatedRows}
        pageNum={currentPage}
        display={display}
        totalItems={totalItems}
        onPageChange={setPageNum}
      />
    </div>
  )
}


