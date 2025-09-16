import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import { getEmployees, getAreas } from '@/features/worker/api/workerApi'
import type {
  Employee,
  TrainingStatus,
  UserRole,
  GetEmployeesParams,
  AreaOption,
} from '@/features/worker/types'
import { useUserRole } from '@/stores/authStore'

// 교육상태 라벨 매핑
const trainingStatusLabels: Record<TrainingStatus, string> = {
  COMPLETED: '교육완료',
  EXPIRED: '만료',
  NOT_COMPLETED: '미이수',
}

const roleLabel = (role: UserRole): string =>
  role === 'AREA_ADMIN' ? '현장 관리자' : '작업자'

export const MobileWorkerListPage = () => {
  // 사용자 권한 확인
  const userRole = useUserRole()

  // 상태 관리
  const [searchInput, setSearchInput] = useState<string>('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<TrainingStatus | ''>('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [pagination, setPagination] = useState({
    pageNum: 0,
    display: 10,
    totalItems: 0,
    totalPages: 0,
    first: true,
    last: true,
  })

  // 구역 옵션 (API 연동)
  const [areaOptions, setAreaOptions] = useState<
    Array<Pick<AreaOption, 'areaUuid' | 'areaAlias' | 'areaName'>>
  >([])

  // API 호출 함수
  const fetchEmployees = async (params: GetEmployeesParams = {}) => {
    setLoading(true)
    try {
      const response = await getEmployees({
        areaUuid: selectedArea,
        trainingStatus: selectedStatus || undefined,
        search: params.search || '',
        pageNum: params.pageNum || 0,
        display: 10,
      })

      setEmployees(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('작업자 목록 조회 실패:', error)
      alert('작업자 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 초기 데이터 로드: 구역 + 사용자
  useEffect(() => {
    const init = async () => {
      try {
        const areas = await getAreas()
        const normalized = [
          { areaUuid: '', areaName: '전체', areaAlias: '전체' },
          ...areas,
        ].sort((a, b) =>
          (a.areaAlias ?? a.areaName).localeCompare(b.areaAlias ?? b.areaName),
        )
        setAreaOptions(normalized)
      } catch (e) {
        console.error('구역 목록 조회 실패:', e)
        setAreaOptions([{ areaUuid: '', areaName: '전체', areaAlias: '전체' }])
      } finally {
        fetchEmployees()
      }
    }
    void init()
  }, [])

  // 필터 변경 시 사용자 재조회
  useEffect(() => {
    fetchEmployees()
  }, [selectedArea, selectedStatus])

  // 검색 실행
  const handleSearch = () => {
    fetchEmployees({ search: searchInput.trim() })
  }

  // 검색 입력 엔터키 처리
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 구역 필터 변경
  const handleAreaChange = (areaUuid: string) => {
    setSelectedArea(areaUuid)
  }

  // 교육상태 필터 변경
  const handleStatusChange = (status: TrainingStatus | '') => {
    setSelectedStatus(status)
  }

  return (
    <MobileLayout title="작업자 관리">
      {/* ADMIN인 경우에만 검색 및 필터링 표시 */}
      {userRole === 'ADMIN' && (
        <section css={ui.section}>
          <div css={ui.searchRow}>
            <input
              css={ui.searchInput}
              placeholder="🔍 작업자 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              aria-label="작업자 검색"
            />
            <button
              css={ui.searchButton}
              onClick={handleSearch}
              disabled={loading}
            >
              검색
            </button>
          </div>

          {/* 구역 필터 */}
          <div css={ui.chipRow}>
            {areaOptions.map((area) => (
              <button
                key={area.areaUuid}
                css={ui.chip(selectedArea === area.areaUuid)}
                onClick={() => handleAreaChange(area.areaUuid)}
                disabled={loading}
              >
                {area.areaAlias ?? area.areaName}
              </button>
            ))}
          </div>

          {/* 교육상태 필터 */}
          <div css={ui.chipRow}>
            <button
              css={ui.chip(selectedStatus === '')}
              onClick={() => handleStatusChange('')}
              disabled={loading}
            >
              전체
            </button>
            {(
              ['COMPLETED', 'EXPIRED', 'NOT_COMPLETED'] as TrainingStatus[]
            ).map((status) => (
              <button
                key={status}
                css={ui.chip(selectedStatus === status)}
                onClick={() => handleStatusChange(status)}
                disabled={loading}
              >
                {trainingStatusLabels[status]}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div css={ui.loadingContainer}>
          <div css={ui.loadingText}>작업자 목록을 불러오는 중...</div>
        </div>
      )}

      {/* 리스트 */}
      <div css={ui.list}>
        {employees.map((worker) => (
          <article
            key={worker.userUuid}
            css={ui.card}
            aria-label={`${worker.userName} 카드`}
          >
            <img
              src={worker.photoUrl}
              alt={`${worker.userName} 사진`}
              css={ui.avatar}
            />
            <div css={ui.cardContent}>
              <div css={ui.cardHeader}>
                <h3 css={ui.name}>{worker.userName}</h3>
              </div>
              <p css={ui.meta}>{worker.areaName || '구역 미배정'}</p>
              <p css={ui.trainingStatus(worker.trainingStatus)}>
                {trainingStatusLabels[worker.trainingStatus]}
              </p>
            </div>
            <span css={ui.roleBadge(worker.userRole)}>
              {roleLabel(worker.userRole)}
            </span>
          </article>
        ))}

        {/* 빈 상태 */}
        {!loading && employees.length === 0 && (
          <div css={ui.emptyState}>
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 정보 */}
      {!loading && employees.length > 0 && (
        <div css={ui.paginationInfo}>
          총 {pagination.totalItems}명 • {pagination.pageNum + 1}/
          {pagination.totalPages} 페이지
        </div>
      )}
    </MobileLayout>
  )
}

const ui = {
  section: css`
    padding: 12px 16px;
    background-color: var(--color-bg-white);
    border-bottom: 1px solid var(--color-gray-200);
  `,
  searchRow: css`
    display: flex;
    gap: 8px;
  `,
  searchInput: css`
    flex: 1;
    height: 40px;
    padding: 0 12px;
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    font-size: 14px;
    &::placeholder {
      color: var(--color-gray-500);
    }
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
  `,
  searchButton: css`
    padding: 0 16px;
    height: 40px;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    border: none;
    border-radius: 8px;
    font-family: 'PretendardMedium', sans-serif;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  chipRow: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  `,
  chip: (active: boolean) => css`
    padding: 8px 12px;
    border-radius: 999px;
    background-color: ${active
      ? 'var(--color-primary)'
      : 'var(--color-gray-100)'};
    color: ${active ? 'var(--color-text-white)' : 'var(--color-gray-800)'};
    border: 1px solid ${active ? 'transparent' : 'var(--color-gray-300)'};
    font-size: 12px;
  `,
  list: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 16px 16px;
  `,
  card: css`
    display: grid;
    grid-template-columns: 56px 1fr auto;
    gap: 12px;
    align-items: flex-start;
    padding: 12px;
    background-color: var(--color-bg-white);
    border: 1px solid var(--color-gray-200);
    border-radius: 12px;
  `,
  avatar: css`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--color-gray-200);
  `,
  cardContent: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  cardHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  name: css`
    margin: 0;
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-900);
    font-size: 16px;
  `,
  trainingStatusIcon: css`
    display: flex;
    align-items: center;
  `,
  checkboxCompleted: css`
    color: var(--color-primary);
    font-size: 20px;
  `,
  checkboxEmpty: css`
    color: var(--color-gray-400);
    font-size: 20px;
  `,
  meta: css`
    margin: 0;
    color: var(--color-gray-600);
    font-size: 12px;
  `,
  trainingStatus: (status: TrainingStatus) => css`
    margin: 0;
    font-size: 11px;
    font-family: 'PretendardMedium', sans-serif;
    color: ${status === 'COMPLETED'
      ? 'var(--color-green)'
      : status === 'EXPIRED'
        ? 'var(--color-red)'
        : 'var(--color-yellow)'};
  `,
  roleBadge: (role: UserRole) => css`
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    background-color: ${role === 'AREA_ADMIN'
      ? 'var(--color-primary-light)'
      : 'var(--color-gray-100)'};
    color: ${role === 'AREA_ADMIN'
      ? 'var(--color-primary)'
      : 'var(--color-gray-700)'};
    align-self: flex-start;
  `,
  loadingContainer: css`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 16px;
  `,
  loadingText: css`
    color: var(--color-gray-600);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 14px;
  `,
  emptyState: css`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 16px;
    text-align: center;

    p {
      margin: 0;
      color: var(--color-gray-600);
      font-family: 'PretendardRegular', sans-serif;
      font-size: 14px;
    }
  `,
  paginationInfo: css`
    padding: 12px 16px;
    text-align: center;
    color: var(--color-gray-600);
    font-family: 'PretendardRegular', sans-serif;
    font-size: 12px;
    background-color: var(--color-gray-50);
    border-top: 1px solid var(--color-gray-200);
  `,
}
