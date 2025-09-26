import { css } from '@emotion/react'
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md'

interface PaginationProps {
  pageNum: number
  totalCount: number
  itemPerPage: number
  onPageChange: (newPage: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  pageNum,
  totalCount,
  itemPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / itemPerPage)

  if (totalPages <= 1) return null

  const handlePrevPage = () => {
    onPageChange(Math.max(pageNum - 1, 0))
  }

  const handleNextPage = () => {
    onPageChange(Math.min(pageNum + 1, totalPages - 1))
  }

  const handleFirstPage = () => {
    onPageChange(0)
  }

  const handleLastPage = () => {
    onPageChange(totalPages - 1)
  }

  const getPageNumbers = () => {
    const visibleCount = 5
    const half = Math.floor(visibleCount / 2)
    let start = Math.max(0, pageNum - half)
    let end = Math.min(totalPages - 1, start + visibleCount - 1)
    if (end - start + 1 < visibleCount) {
      start = Math.max(0, end - visibleCount + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const pages = getPageNumbers()

  return (
    <div css={container}>
      <button
        css={arrowButton}
        onClick={handleFirstPage}
        disabled={pageNum === 0}
      >
        <MdKeyboardDoubleArrowLeft />
      </button>
      <button
        css={arrowButton}
        onClick={handlePrevPage}
        disabled={pageNum === 0}
      >
        <MdKeyboardArrowLeft />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          css={[pageButton, page === pageNum && activePage]}
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </button>
      ))}
      <button
        css={arrowButton}
        onClick={handleNextPage}
        disabled={pageNum === totalPages - 1}
      >
        <MdKeyboardArrowRight />
      </button>
      <button
        css={arrowButton}
        onClick={handleLastPage}
        disabled={pageNum === totalPages - 1}
      >
        <MdKeyboardDoubleArrowRight />
      </button>
    </div>
  )
}

export default Pagination

const container = css`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 24px 0;
`

const baseButton = css`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-radius: 50%;
  padding: 0;
`

const arrowButton = css`
  ${baseButton};
  font-size: 24px;
  color: #333;

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`

const pageButton = css`
  ${baseButton};
  font-size: 16px;
  color: #333;

  &:hover {
    background-color: #f0f0f0;
  }
`

const activePage = css`
  background-color: #1976d2;
  color: white;
  font-weight: bold;

  &:hover {
    background-color: #1976d2;
  }
`
