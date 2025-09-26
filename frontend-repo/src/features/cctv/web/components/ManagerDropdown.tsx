import { css } from '@emotion/react'
import { useState, useEffect, useRef } from 'react'
import { searchAreaAdmins, assignManager } from '@/features/cctv/api/areaApi'
import type { AreaAdminUser, AssignManagerRequest } from '@/features/cctv/types'
import { useToast } from '@/hooks/useToast'

interface ManagerDropdownProps {
  areaUuid: string
  currentManagerName: string
  onManagerAssigned: () => void
}

export const ManagerDropdown = ({
  areaUuid,
  currentManagerName,
  onManagerAssigned,
}: ManagerDropdownProps) => {
  const toast = useToast()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [admins, setAdmins] = useState<AreaAdminUser[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [assigning, setAssigning] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const loadAdmins = async () => {
    if (loading) return

    setLoading(true)
    try {
      const response = await searchAreaAdmins({ pageNum: 0, display: 100 })
      setAdmins(response.data)
    } catch (error) {
      console.error('담당자 목록 로드 실패:', error)
      toast.error('담당자 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      loadAdmins()
    }
    setIsOpen(!isOpen)
  }

  const handleAssignManager = async (admin: AreaAdminUser) => {
    if (assigning) return

    setAssigning(true)
    try {
      const request: AssignManagerRequest = {
        userUuid: admin.userUuid,
        areaUuid: areaUuid,
      }

      await assignManager(request)
      onManagerAssigned()
      setIsOpen(false)
      toast.success(`${admin.userName}님이 담당자로 지정되었습니다.`)
    } catch (err) {
      console.error('담당자 지정 실패:', err)
      toast.error('담당자 지정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div css={styles.container} ref={dropdownRef}>
      <button css={styles.trigger} onClick={handleToggle} disabled={assigning}>
        <span css={styles.managerText}>{currentManagerName || '미배정'}</span>
        <span css={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div css={styles.dropdown}>
          {loading ? (
            <div css={styles.loading}>담당자 목록을 불러오는 중...</div>
          ) : admins.length === 0 ? (
            <div css={styles.empty}>
              담당자로 지정할 수 있는 사용자가 없습니다.
            </div>
          ) : (
            <div css={styles.list}>
              {admins.map((admin) => (
                <button
                  key={admin.userUuid}
                  css={styles.item}
                  onClick={() => handleAssignManager(admin)}
                  disabled={assigning}
                >
                  <span css={styles.userName}>{admin.userName}</span>
                  <span css={styles.userId}>({admin.userId})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: css`
    position: relative;
    display: inline-block;
  `,
  trigger: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid var(--color-gray-300);
    border-radius: 6px;
    background-color: var(--color-bg-white);
    color: var(--color-gray-700);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;

    &:hover {
      border-color: var(--color-primary);
      background-color: var(--color-primary-light);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
  managerText: css`
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  arrow: css`
    font-size: 10px;
    color: var(--color-gray-500);
    transition: transform 0.2s ease;
  `,
  dropdown: css`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: var(--color-bg-white);
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-top: 4px;
    max-height: 200px;
    overflow-y: auto;
  `,
  loading: css`
    padding: 12px 16px;
    text-align: center;
    color: var(--color-gray-600);
    font-size: 14px;
  `,
  empty: css`
    padding: 12px 16px;
    text-align: center;
    color: var(--color-gray-500);
    font-size: 14px;
  `,
  list: css`
    padding: 4px 0;
  `,
  item: css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--color-gray-100);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
  userName: css`
    font-family: 'PretendardSemiBold', sans-serif;
    color: var(--color-gray-800);
    font-size: 14px;
    margin-bottom: 2px;
  `,
  userId: css`
    color: var(--color-gray-500);
    font-size: 12px;
  `,
}
