import { useState } from 'react'
import { css } from '@emotion/react'
import { useFCM } from '@/features/notification/hooks/useFCM'
import NotificationItem from '@/features/notification/components/NotificationItem'
import ImageModal from '@/features/notification/components/ImageModal'
import NoticeSendForm from '@/features/notice/components/NoticeSendForm'
import ViolationDetailModal from '@/features/violation/components/ViolationDetailModal'
import { noticeApi } from '@/features/notice/services/noticeApi'
import type { NoticeFormData, Area } from '@/features/notice/types'

interface SelectedImageData {
  imageUrl: string
  title: string
  areaName?: string
  cctvName?: string
  equipmentTypes?: string
}

const NotificationPanel: React.FC = () => {
  const {
    isRegistered,
    isLoading,
    error,
    notifications,
    notices,
    registerToken,
    clearNotifications,
    clearNotices,
    removeNotice,
    removeNotification
  } = useFCM()

  // 공지사항 발송 관련 상태
  const [showSendForm, setShowSendForm] = useState<boolean>(false)
  const [areas, setAreas] = useState<Area[]>([])
  const [isSending, setIsSending] = useState<boolean>(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Violation 상세 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedViolationUuid, setSelectedViolationUuid] = useState<string | null>(null)

  // 이미지 모달 상태
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false)
  const [selectedImageData, setSelectedImageData] = useState<SelectedImageData | null>(null)

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: any) => {
    console.log('NotificationPanel handleNotificationClick:', {
      notification,
      data: notification.data,
      violationUuid: notification.data?.violationUuid,
      imageUrl: notification.data?.imageUrl,
      type: notification.data?.type
    })
    
    const violationUuid = notification.data?.violationUuid
    const imageUrl = notification.data?.imageUrl
    
    if (violationUuid) {
      // 안전장비 위반 알림 - 상세 모달 열기
      setSelectedViolationUuid(violationUuid)
      setIsModalOpen(true)
    } else if (imageUrl) {
      // 중장비 진입 알림 - 이미지 모달 열기
      setSelectedImageData({
        imageUrl,
        title: notification.title,
        areaName: notification.data?.areaName,
        cctvName: notification.data?.cctvName,
        equipmentTypes: notification.data?.heavyEquipmentTypes
      })
      setIsImageModalOpen(true)
    } else {
      console.warn('No violationUuid or imageUrl found in notification data')
    }
  }

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedViolationUuid(null)
  }

  // 이미지 모달 닫기 핸들러
  const handleImageModalClose = () => {
    setIsImageModalOpen(false)
    setSelectedImageData(null)
  }


  // 구역 목록 로드
  const loadAreas = async () => {
    try {
      const response = await noticeApi.getAreas()
      // Area 타입에 맞게 isSelected 속성 추가
      const areasWithSelection = response.areas.map((area: { id: string; name: string }) => ({
        ...area,
        isSelected: false
      }))
      setAreas(areasWithSelection)
    } catch (error) {
      console.error('구역 목록 로드 실패:', error)
    }
  }

  // 공지사항 발송
  const handleSendNotice = async (formData: NoticeFormData) => {
    setIsSending(true)
    setSendError(null)
    
    try {
      const areaUuids = formData.isAllTarget ? [] : formData.targetAreas
      
      const result = await noticeApi.sendNotice({
        title: formData.title,
        content: formData.content,
        areaUuids: areaUuids
      })
      
      if (result.success) {
        alert('공지사항이 성공적으로 발송되었습니다!')
        setShowSendForm(false)
      } else {
        setSendError(result.message || '공지사항 발송에 실패했습니다.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '공지사항 발송에 실패했습니다.'
      setSendError(errorMessage)
      console.error('공지사항 발송 실패:', error)
    } finally {
      setIsSending(false)
    }
  }

  // 공지 발송 버튼 클릭
  const handleSendButtonClick = () => {
    if (!showSendForm) {
      loadAreas()
    }
    setShowSendForm(!showSendForm)
  }


  return (
    <div css={container}>
      {/* 알림 섹션 */}
      <div css={notificationSection}>
        <div css={sectionHeader}>
          <h2 css={sectionTitle}>알림 목록</h2>
          <div css={buttonSection}>
            {!isRegistered && (
              <button
                onClick={registerToken}
                disabled={isLoading}
                css={primaryButton}
              >
                {isLoading ? '등록 중...' : '알림 활성화'}
              </button>
            )}
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div css={errorCard}>
            <div css={errorIcon}>⚠️</div>
            <div css={errorText}>{error}</div>
          </div>
        )}

        {/* 알림 관리 버튼 */}
        {notifications.length > 0 && (
          <div css={buttonContainer}>
            <button onClick={clearNotifications} css={clearAllButton}>
              모두 지우기
            </button>
          </div>
        )}

        {/* 알림 목록 */}
        <div css={notificationsContainer}>
          {notifications.length > 0 ? (
            <div css={notificationList}>
                     {notifications.map((notification) => (
                       <div key={notification.id} css={noticeItemWithHover}>
                  <NotificationItem
                    notification={notification}
                    timestamp={new Date(notification.timestamp || '').toLocaleTimeString()}
                    onClick={() => handleNotificationClick(notification)}
                  />
                         <button 
                           css={deleteButton}
                           onClick={() => removeNotification(notification.id)}
                           title="알림 삭제"
                         >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div css={emptyState}>
              <div css={emptyIcon}>📢</div>
              <div css={emptyText}>
                {isRegistered ? '새로운 알림이 없습니다' : '알림을 활성화해주세요'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 공지사항 섹션 */}
      <div css={noticeSection}>
        <div css={noticeHeader}>
          <h2 css={noticeTitle}>공지 목록</h2>
          <div css={noticeButtonGroup}>
            {notices.length > 0 && (
              <button onClick={clearNotices} css={clearNoticesButton}>
                모두 지우기
              </button>
            )}
            <button 
              onClick={handleSendButtonClick}
              css={sendNoticeButton}
            >
              {showSendForm ? '취소' : '공지 발송'}
            </button>
          </div>
        </div>

        {/* 공지사항 발송 폼 */}
        {showSendForm ? (
          <div css={sendFormContainer}>
            <NoticeSendForm
              areas={areas}
              onSubmit={handleSendNotice}
              isLoading={isSending}
            />
            {sendError && (
              <div css={errorMessage}>
                {sendError}
              </div>
            )}
          </div>
        ) : (
          <div css={noticeList}>
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice.id} css={noticeItemWithHover}>
                  <div css={noticeDot}></div>
                  <div css={noticeContent}>
                    <div css={noticeTitleText}>{notice.title}</div>
                    <div css={noticeDescription}>{notice.content}</div>
                    <div css={noticeMeta}>
                      {notice.timestamp} {notice.sender}
                    </div>
                  </div>
                  <button 
                    css={deleteButton}
                    onClick={() => removeNotice(notice.id)}
                    title="공지사항 삭제"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div css={emptyNoticeState}>
                <div css={emptyNoticeIcon}>📢</div>
                <div css={emptyNoticeText}>공지사항이 없습니다</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Violation 상세 모달 */}
      <ViolationDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        violationUuid={selectedViolationUuid}
      />

      {/* 이미지 모달 */}
      {selectedImageData && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={handleImageModalClose}
          imageUrl={selectedImageData.imageUrl}
          title={selectedImageData.title}
          areaName={selectedImageData.areaName}
          cctvName={selectedImageData.cctvName}
          equipmentTypes={selectedImageData.equipmentTypes}
        />
      )}
    </div>
  )
}

const container = css`
  height: 100vh;
  padding: 1.5%;
  background: var(--color-bg-white);
  overflow-y: auto;
  font-family: 'PretendardRegular', sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
`

const notificationSection = css`
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 1.5%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-200);
  width: 100%;
  box-sizing: border-box;
`

const sectionHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--color-primary);
`

const sectionTitle = css`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0;
  text-decoration: underline;
  text-decoration-color: var(--color-primary);
  text-underline-offset: 0.25rem;
`

const buttonSection = css`
  display: flex;
  gap: 0.5rem;
`

const primaryButton = css`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  color: var(--color-text-white);
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`



const errorCard = css`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, var(--color-red) 0%, #ee5a24 100%);
  color: var(--color-text-white);
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(255, 24, 24, 0.3);
`

const errorIcon = css`
  font-size: 1.25rem;
  margin-right: 0.5rem;
`

const errorText = css`
  font-size: 0.875rem;
  font-weight: 500;
`

const buttonContainer = css`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding: 0 0.25rem;
`

const clearAllButton = css`
  padding: 0.5rem 1rem;
  background: var(--color-red);
  color: var(--color-text-white);
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff5252;
    transform: translateY(-1px);
  }
`

const notificationsContainer = css`
  flex: 1;
`

const notificationList = css`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 25rem;
  overflow-y: auto;
  padding-right: 0.25rem;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 0.375rem;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-gray-100);
    border-radius: 0.1875rem;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-gray-400);
    border-radius: 0.1875rem;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-500);
  }
`

const emptyState = css`
  text-align: center;
  padding: 3.75rem 1.25rem;
  background: var(--color-bg-white);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`

const emptyIcon = css`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const emptyText = css`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 0.75rem;
`

const noticeSection = css`
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 1.5%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-200);
  width: 100%;
  box-sizing: border-box;
`

const noticeHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--color-green);
`

const noticeTitle = css`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0;
  text-decoration: underline;
  text-decoration-color: var(--color-green);
  text-underline-offset: 0.25rem;
`

const sendNoticeButton = css`
  padding: 0.5rem 1rem;
  background: var(--color-green);
  color: var(--color-text-white);
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #45a049;
    transform: translateY(-1px);
  }
`

const noticeList = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 25rem;
  overflow-y: auto;
  padding-right: 0.25rem;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 0.375rem;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-gray-100);
    border-radius: 0.1875rem;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-gray-400);
    border-radius: 0.1875rem;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-gray-500);
  }
`

const noticeButtonGroup = css`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const clearNoticesButton = css`
  padding: 0.375rem 0.75rem;
  background: var(--color-red);
  color: var(--color-text-white);
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ff5252;
    transform: translateY(-1px);
  }
`


const noticeDot = css`
  width: 0.75rem;
  height: 0.75rem;
  background: var(--color-green);
  border-radius: 50%;
  margin-top: 0.375rem;
  flex-shrink: 0;
`

const noticeContent = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
  width: 100%;
`

const noticeTitleText = css`
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-gray-800);
  line-height: 1.4;
  margin: 0;
`

const noticeDescription = css`
  font-size: 0.875rem;
  color: var(--color-gray-600);
  line-height: 1.5;
  margin: 0;
`

const noticeMeta = css`
  font-size: 0.75rem;
  color: var(--color-gray-500);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

const emptyNoticeState = css`
  text-align: center;
  padding: 2.5rem 1.25rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border: 2px dashed var(--color-gray-300);
`

const emptyNoticeIcon = css`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
  color: var(--color-green);
`

const emptyNoticeText = css`
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-gray-500);
  margin: 0;
`

const deleteButton = css`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--color-red);
  color: var(--color-text-white);
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #ff5252;
    transform: scale(1.1);
  }
`

const noticeItemWithHover = css`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-bg-white);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  min-width: 0;
  position: relative;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
    
    button {
      opacity: 1;
    }
  }
`

const sendFormContainer = css`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
`

const errorMessage = css`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fee;
  color: var(--color-red);
  border-radius: 6px;
  font-size: 0.875rem;
  border: 1px solid #f5c6cb;
`


export default NotificationPanel
