import { css } from '@emotion/react'
import { useState } from 'react'
import NoticeList from '@/features/notice/components/NoticeList'
import NoticeSendForm from '@/features/notice/components/NoticeSendForm'
import { useNotice } from '@/features/notice/hooks/useNotice'
import type { NoticeFormData } from '@/features/notice/types'

const NoticeManagement = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'send'>('send')
  const { notices, areas, isLoading, error, sendNotice } = useNotice()

  const handleSendNotice = async (formData: NoticeFormData) => {
    // 전체 발송인 경우 빈 배열, 구역별 발송인 경우 선택된 구역 UUID 배열
    const areaUuids = formData.isAllTarget ? [] : formData.targetAreas
    
    const result = await sendNotice({
      title: formData.title,
      content: formData.content,
      areaUuids: areaUuids
    })
    
    if (result.success) {
      alert('공지사항이 성공적으로 발송되었습니다!')
    } else {
      alert(`공지사항 발송에 실패했습니다: ${result.message}`)
    }
  }

  return (
    <div css={container}>
      {/* 탭 헤더 */}
      <div css={tabHeader}>
        <button
          onClick={() => setActiveTab('list')}
          css={tabButton(activeTab === 'list')}
        >
          공지 목록
        </button>
        <button
          onClick={() => setActiveTab('send')}
          css={tabButton(activeTab === 'send')}
        >
          공지 발송
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div css={errorContainer}>
          <div css={errorMessage}>
            {error}
          </div>
        </div>
      )}

      {/* 탭 콘텐츠 */}
      <div css={tabContent}>
        {activeTab === 'list' ? (
          <NoticeList notices={notices} isLoading={isLoading} />
        ) : (
          <NoticeSendForm
            areas={areas}
            onSubmit={handleSendNotice}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

const container = css`
  height: 100vh;
  background-color: var(--color-bg-white);
  display: flex;
  flex-direction: column;
`

const tabHeader = css`
  display: flex;
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-bg-white);
`

const tabButton = (isActive: boolean) => css`
  flex: 1;
  padding: 16px 20px;
  background-color: ${isActive ? 'var(--color-bg-white)' : 'var(--color-gray-50)'};
  border: none;
  border-bottom: 2px solid ${isActive ? 'var(--color-primary)' : 'transparent'};
  color: ${isActive ? 'var(--color-primary)' : 'var(--color-gray-600)'};
  font-size: 14px;
  font-weight: ${isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${isActive ? 'var(--color-bg-white)' : 'var(--color-gray-100)'};
  }

  &:first-of-type {
    border-right: 1px solid var(--color-gray-200);
  }
`

const tabContent = css`
  flex: 1;
  overflow-y: auto;
`

const errorContainer = css`
  padding: 16px 20px;
  background-color: #fee;
  border-bottom: 1px solid #fcc;
`

const errorMessage = css`
  color: var(--color-red);
  font-size: 14px;
  font-weight: 500;
`

export default NoticeManagement
