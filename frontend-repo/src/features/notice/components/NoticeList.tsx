import { css } from '@emotion/react'
import type { Notice } from '@/features/notice/types'

interface NoticeListProps {
  notices: Notice[]
  isLoading?: boolean
}

const NoticeList = ({ notices, isLoading = false }: NoticeListProps) => {
  if (isLoading) {
    return (
      <div css={container}>
        <div css={loadingContainer}>
          <div css={loadingSpinner} />
          <p css={loadingText}>공지사항을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (notices.length === 0) {
    return (
      <div css={container}>
        <div css={emptyContainer}>
          <div css={emptyIcon}>📢</div>
          <p css={emptyText}>발송된 공지사항이 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div css={container}>
      <div css={listContainer}>
        {notices.map(notice => (
          <div key={notice.announcementUuid} css={noticeItem}>
            <div css={noticeHeader}>
              <h4 css={noticeTitle}>{notice.title}</h4>
              <span css={noticeStatus(notice.status)}>
                {notice.status === 'sent' ? '발송됨' : 
                 notice.status === 'draft' ? '임시저장' : '예약됨'}
              </span>
            </div>
            
            <p css={noticeContent}>{notice.content}</p>
            
            <div css={noticeFooter}>
              <div css={noticeTarget}>
                <span css={targetText}>
                  수신자: {notice.receiverName}
                </span>
              </div>
              
              <div css={noticeMeta}>
                <span css={noticeAuthor}>{notice.senderName}</span>
                <span css={noticeDate}>
                  {new Date(notice.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const container = css`
  padding: 20px;
  background-color: var(--color-bg-white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const loadingContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`

const loadingSpinner = css`
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const loadingText = css`
  color: var(--color-gray-500);
  font-size: 14px;
  margin: 0;
`

const emptyContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`

const emptyIcon = css`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`

const emptyText = css`
  color: var(--color-gray-500);
  font-size: 16px;
  margin: 0;
`

const listContainer = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const noticeItem = css`
  padding: 16px;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  background-color: var(--color-bg-white);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

const noticeHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`

const noticeTitle = css`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-800);
  flex: 1;
  margin-right: 12px;
`

const noticeStatus = (status: string) => css`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  
  ${status === 'sent' && css`
    background-color: var(--color-green-light);
    color: var(--color-green);
  `}
  
  ${status === 'draft' && css`
    background-color: var(--color-gray-100);
    color: var(--color-gray-600);
  `}
  
  ${status === 'scheduled' && css`
    background-color: var(--color-yellow-light);
    color: var(--color-yellow);
  `}
`

const noticeContent = css`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--color-gray-600);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const noticeFooter = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-gray-500);
`

const noticeTarget = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

const targetTag = css`
  padding: 2px 6px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 3px;
  font-weight: 500;
`

const targetText = css`
  color: var(--color-gray-600);
`

const noticeMeta = css`
  display: flex;
  align-items: center;
  gap: 12px;
`

const noticeAuthor = css`
  font-weight: 500;
`

const noticeDate = css`
  color: var(--color-gray-400);
`

export default NoticeList
