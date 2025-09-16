import { css } from '@emotion/react'
import { MdOutlineCheckBoxOutlineBlank } from 'react-icons/md'
import { IoCheckbox } from 'react-icons/io5'

interface SelectionCheckboxProps {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  'aria-label'?: string
}

export const SelectionCheckbox = ({
  checked,
  onToggle,
  disabled = false,
  'aria-label': ariaLabel = 'select row',
}: SelectionCheckboxProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      css={styles.button}
   >
      {checked ? (
        <IoCheckbox css={styles.checked} />
      ) : (
        <MdOutlineCheckBoxOutlineBlank css={styles.unchecked} />
      )}
    </button>
  )
}

const styles = {
  button: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  checked: css`
    color: var(--color-primary);
    font-size: 18px;
  `,
  unchecked: css`
    color: var(--color-gray-400);
    font-size: 18px;
  `,
}


