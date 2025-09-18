import { useState, useRef, useEffect } from 'react'
import { css } from '@emotion/react'
import { MdKeyboardArrowDown } from 'react-icons/md'
import type { UserRole } from '@/features/worker/types'

interface RoleDropdownProps {
  currentRole: UserRole
  onRoleChange: (newRole: UserRole) => void
  disabled?: boolean
}

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'WORKER', label: '작업자' },
  { value: 'AREA_ADMIN', label: '구역 관리자' },
]

export const RoleDropdown = ({
  currentRole,
  onRoleChange,
  disabled = false,
}: RoleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentOption = roleOptions.find(option => option.value === currentRole)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionClick = (newRole: UserRole, event: React.MouseEvent) => {
    event.stopPropagation()
    if (newRole !== currentRole) {
      onRoleChange(newRole)
    }
    setIsOpen(false)
  }

  return (
    <div css={styles.container} ref={dropdownRef}>
      <button
        css={styles.trigger(disabled)}
        onClick={(e) => {
          e.stopPropagation()
          !disabled && setIsOpen(!isOpen)
        }}
        disabled={disabled}
        type="button"
      >
        <span css={styles.roleBadge(currentRole)}>
          {currentOption?.label || '작업자'}
        </span>
        <MdKeyboardArrowDown css={styles.arrow(isOpen)} />
      </button>

      {isOpen && (
        <div css={styles.dropdown}>
          {roleOptions.map((option) => (
            <button
              key={option.value}
              css={styles.option(option.value === currentRole)}
              onClick={(e) => handleOptionClick(option.value, e)}
              type="button"
            >
              <span css={styles.roleBadge(option.value)}>
                {option.label}
              </span>
            </button>
          ))}
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
  trigger: (disabled: boolean) => css`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    opacity: ${disabled ? 0.5 : 1};

    &:hover:not(:disabled) {
      background-color: var(--color-gray-50);
      border-color: var(--color-gray-300);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
  `,
  arrow: (isOpen: boolean) => css`
    font-size: 16px;
    color: var(--color-gray-500);
    transition: transform 0.2s ease;
    transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  `,
  dropdown: css`
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 120px;
    margin-top: 4px;
    background-color: var(--color-bg-white);
    border: 1px solid var(--color-gray-300);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  `,
  option: (isSelected: boolean) => css`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    border: none;
    background-color: ${isSelected ? 'var(--color-primary-light)' : 'transparent'};
    color: var(--color-gray-800);
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${isSelected 
        ? 'var(--color-primary-light)' 
        : 'var(--color-gray-50)'};
    }

    &:first-of-type {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    &:last-of-type {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  `,
  roleBadge: (role: UserRole) => css`
    display: inline-block;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-family: 'PretendardMedium', sans-serif;
    background-color: ${role === 'AREA_ADMIN'
      ? 'var(--color-primary-light)'
      : 'var(--color-gray-100)'};
    color: ${role === 'AREA_ADMIN'
      ? 'var(--color-primary)'
      : 'var(--color-gray-700)'};
  `,
}
