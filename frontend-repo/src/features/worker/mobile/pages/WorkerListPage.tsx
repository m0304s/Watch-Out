import { useMemo, useState } from 'react'
import { css } from '@emotion/react'

import { MobileLayout } from '@/components/mobile/MobileLayout'
import type { Employee, PaginatedResponse, TrainingStatus, UserRole } from '@/features/worker/types'

// API 연결 전까지 사용할 더미 데이터 (요구 포맷 반영)
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
      userRole: 'WORKER',
      photoUrl: 'https://via.placeholder.com/56',
    },
    {
      userUuid: '22c99179-5189-5b71-c809-f29abb9g5d3b',
      userId: '7654321',
      userName: '박성실',
      companyName: '건설안전 주식회사',
      areaName: 'B구역',
      trainingStatus: 'EXPIRED',
      lastEntryTime: '2025-09-07T09:01:30Z',
      userRole: 'AREA_ADMIN',
      photoUrl: 'https://via.placeholder.com/56',
    },
  ],
  pagination: {
    pageNum: 1,
    display: 10,
    totalItems: 2,
    totalPages: 1,
  },
}


const roleLabel = (role: UserRole): string => (role === 'AREA_ADMIN' ? '현장 관리자' : '작업자')

export const MobileWorkerListPage = () => {
  const [search, setSearch] = useState<string>('')
  const [areaFilters, setAreaFilters] = useState<string[]>([])
  const [statusFilters, setStatusFilters] = useState<TrainingStatus[]>([])

  const areaOptions = useMemo(
    () => Array.from(new Set(MOCK_DATA.data.map((d) => d.areaName))),
    [],
  )

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase()
    return MOCK_DATA.data.filter((d) => {
      const matchesText = !text || d.userName.toLowerCase().includes(text)
      const matchesArea = areaFilters.length === 0 || areaFilters.includes(d.areaName)
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(d.trainingStatus)
      return matchesText && matchesArea && matchesStatus
    })
  }, [search, areaFilters, statusFilters])

  const toggleArea = (area: string) => {
    setAreaFilters((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const toggleStatus = (st: TrainingStatus) => {
    setStatusFilters((prev) => (prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]))
  }

  return (
    <MobileLayout title="작업자 관리">
      {/* 검색 */}
      <section css={ui.section}>
        <div css={ui.searchRow}>
          <input
            css={ui.searchInput}
            placeholder="🔍 작업자 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="작업자 검색"
          />
        </div>
        {/* 구역 필터 */}
        <div css={ui.chipRow}>
          {areaOptions.map((a) => (
            <button key={a} css={ui.chip(areaFilters.includes(a))} onClick={() => toggleArea(a)}>
              {a}
            </button>
          ))}
        </div>
        {/* 교육상태 필터 */}
        <div css={ui.chipRow}>
          {(['COMPLETED', 'EXPIRED'] as TrainingStatus[]).map((s) => (
            <button key={s} css={ui.chip(statusFilters.includes(s))} onClick={() => toggleStatus(s)}>
              {s === 'COMPLETED' ? '교육완료' : '만료'}
            </button>
          ))}
        </div>
      </section>

      {/* 리스트 */}
      <div css={ui.list}>
        {filtered.map((w) => (
          <article key={w.userUuid} css={ui.card} aria-label={`${w.userName} 카드`}>
            <img src={w.photoUrl} alt={`${w.userName} 사진`} css={ui.avatar} />
            <div>
              <h3 css={ui.name}>{w.userName}</h3>
              <p css={ui.meta}>{w.areaName}</p>
            </div>
            <span css={ui.roleBadge(w.userRole)}>{roleLabel(w.userRole)}</span>
          </article>
        ))}
      </div>
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
    chipRow: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
    `,
    chip: (active: boolean) => css`
    padding: 8px 12px;
    border-radius: 999px;
    background-color: ${active ? 'var(--color-primary)' : 'var(--color-gray-100)'};
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
    align-items: center;
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
    name: css`
    margin: 0;
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-900);
    font-size: 16px;
    `,
    meta: css`
    margin: 2px 0 0;
    color: var(--color-gray-600);
    font-size: 12px;
    `,
    roleBadge: (role: UserRole) => css`
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    background-color: ${role === 'AREA_ADMIN' ? 'var(--color-primary-light)' : 'var(--color-gray-100)'};
    color: ${role === 'AREA_ADMIN' ? 'var(--color-primary)' : 'var(--color-gray-700)'};
    `,
}