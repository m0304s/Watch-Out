import { css } from '@emotion/react'
import { useEffect, useMemo, useState } from 'react'
import { useUserRole } from '@/stores/authStore'
import { AreaTable } from '@/features/cctv/web/components/AreaTable'
import { getAreas } from '@/features/cctv/api/areaApi'
import type { AreaItem, PaginatedResponse } from '@/features/cctv/types'

const DISPLAY = 10

export const AreaManagementPage = () => {
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

  return (
    <div css={pageStyles.container}>
      <div css={pageStyles.toolbar}>
        <div css={pageStyles.searchGroup}>
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
          <button type="button" css={pageStyles.primaryBtn}>
            + 추가
          </button>
        </div>
      </div>

      <AreaTable
        rows={rows}
        pageNum={pageNum}
        display={DISPLAY}
        totalItems={totalItems}
        onPageChange={handlePageChange}
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
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
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
    width: 280px;
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
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--color-gray-300);
    background: var(--color-gray-100);
    color: var(--color-gray-800);
    font-size: 14px;
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
