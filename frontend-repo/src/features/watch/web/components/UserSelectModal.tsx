import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { BaseModal } from '@/components/common/Modal/BaseModal'
import { ModalHeader } from '@/components/common/Modal/ModalHeader'
import { ModalContent } from '@/components/common/Modal/ModalContent'
import type { Employee, PaginatedResponse } from '@/features/worker/types'
import { getEmployees } from '@/features/worker/api/workerApi'

interface UserSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (user: Employee) => void
}

export const UserSelectModal = ({
  isOpen,
  onClose,
  onSelect,
}: UserSelectModalProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<Employee[]>([])
  const [pageNum, setPageNum] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [search, setSearch] = useState<string>('')

  const fetchUsers = async (
    page: number = pageNum,
    keyword: string = search,
  ) => {
    try {
      setLoading(true)
      setError(null)
      const res: PaginatedResponse<Employee> = await getEmployees({
        pageNum: page,
        display: 10,
        search: keyword,
      })
      setUsers(res.data)
      setTotalPages(res.pagination.totalPages)
    } catch (err) {
      console.error('사용자 목록 조회 실패:', err)
      setError('사용자 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      void fetchUsers(0, '')
      setPageNum(0)
      setSearch('')
    }
  }, [isOpen])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void fetchUsers(0, search)
    setPageNum(0)
  }

  const handlePrev = () => {
    const next = Math.max(0, pageNum - 1)
    setPageNum(next)
    void fetchUsers(next)
  }

  const handleNext = () => {
    const next = Math.min(totalPages - 1, pageNum + 1)
    setPageNum(next)
    void fetchUsers(next)
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="large">
      <ModalHeader title="사용자 선택" onClose={onClose} />
      <ModalContent>
        <div css={styles.container}>
          <form css={styles.searchRow} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="이름/ID 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              css={styles.searchInput}
              disabled={loading}
            />
            <button type="submit" css={styles.searchBtn} disabled={loading}>
              검색
            </button>
          </form>

          {loading ? (
            <div css={styles.centerArea}>불러오는 중...</div>
          ) : error ? (
            <div css={styles.errorArea}>{error}</div>
          ) : (
            <div css={styles.list}>
              <table css={styles.table}>
                <thead>
                  <tr>
                    <th css={styles.th}>이름</th>
                    <th css={styles.th}>아이디</th>
                    <th css={styles.th}>회사</th>
                    <th css={styles.th}>구역</th>
                    <th css={styles.thAction}>선택</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userUuid}>
                      <td css={styles.td}>{u.userName}</td>
                      <td css={styles.td}>{u.userId}</td>
                      <td css={styles.td}>{u.companyName}</td>
                      <td css={styles.td}>{u.areaName}</td>
                      <td css={styles.tdAction}>
                        <button
                          type="button"
                          css={styles.selectBtn}
                          onClick={() => onSelect(u)}
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div css={styles.pager}>
            <button
              type="button"
              css={styles.pagerBtn}
              onClick={handlePrev}
              disabled={loading || pageNum <= 0}
            >
              이전
            </button>
            <span css={styles.pageInfo}>
              {pageNum + 1} / {totalPages}
            </span>
            <button
              type="button"
              css={styles.pagerBtn}
              onClick={handleNext}
              disabled={loading || pageNum >= totalPages - 1}
            >
              다음
            </button>
          </div>
        </div>
      </ModalContent>
    </BaseModal>
  )
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px 20px 16px;
  `,
  searchRow: css`
    display: flex;
    gap: 8px;
  `,
  searchInput: css`
    flex: 1;
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
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    font-family: 'PretendardSemiBold', sans-serif;
    cursor: pointer;
  `,
  centerArea: css`
    padding: 24px;
    text-align: center;
    color: var(--color-gray-700);
  `,
  errorArea: css`
    padding: 12px 16px;
    background-color: var(--color-red-light);
    border: 1px solid var(--color-red);
    border-radius: 8px;
    color: var(--color-red);
  `,
  list: css`
    border: 1px solid var(--color-gray-200);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--color-bg-white);
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
  `,
  th: css`
    text-align: left;
    padding: 10px 12px;
    background-color: var(--color-gray-100);
    color: var(--color-gray-800);
    font-family: 'PretendardSemiBold', sans-serif;
    font-size: 13px;
  `,
  thAction: css`
    width: 90px;
    padding: 10px 12px;
    background-color: var(--color-gray-100);
  `,
  td: css`
    padding: 10px 12px;
    border-top: 1px solid var(--color-gray-200);
    font-size: 13px;
    color: var(--color-gray-800);
  `,
  tdAction: css`
    padding: 8px 12px;
    border-top: 1px solid var(--color-gray-200);
  `,
  selectBtn: css`
    padding: 6px 10px;
    border-radius: 6px;
    border: none;
    background-color: var(--color-primary);
    color: var(--color-text-white);
    font-size: 12px;
    cursor: pointer;
  `,
  pager: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding-top: 8px;
  `,
  pagerBtn: css`
    padding: 6px 12px;
    border-radius: 6px;
    background-color: var(--color-bg-white);
    border: 1px solid var(--color-gray-300);
    color: var(--color-gray-700);
    font-size: 13px;
    cursor: pointer;
  `,
  pageInfo: css`
    color: var(--color-gray-600);
    font-size: 13px;
  `,
}
