import { css } from '@emotion/react'
import { useState } from 'react'
import { MdOutlineClose } from 'react-icons/md'
import { useFCM } from '@/features/notification/hooks/useFCM'
import NotificationItem from '@/features/notification/components/NotificationItem'
import ImageModal from '@/features/notification/components/ImageModal'
import NoticeSendForm from '@/features/notice/components/NoticeSendForm'
import ViolationDetailModal from '@/features/violation/components/ViolationDetailModal'
import { noticeApi } from '@/features/notice/services/noticeApi'
import type { NoticeFormData, Area } from '@/features/notice/types'
import { useToast } from '@/hooks'

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
    removeNotification,
  } = useFCM()

  const toast = useToast()

  // 공지사항 발송 관련 상태
  const [showSendForm, setShowSendForm] = useState<boolean>(false)
  const [areas, setAreas] = useState<Area[]>([])
  const [isSending, setIsSending] = useState<boolean>(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Violation 상세 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedViolationUuid, setSelectedViolationUuid] = useState<
    string | null
  >(null)

  // 이미지 모달 상태
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false)
  const [selectedImageData, setSelectedImageData] =
    useState<SelectedImageData | null>(null)

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: any) => {
    console.log('NotificationPanel handleNotificationClick:', {
      notification,
      data: notification.data,
      violationUuid: notification.data?.violationUuid,
      imageUrl: notification.data?.imageUrl,
      type: notification.data?.type,
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
        equipmentTypes: notification.data?.heavyEquipmentTypes,
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
      const areasWithSelection = response.areas.map(
        (area: { id: string; name: string }) => ({
          ...area,
          isSelected: false,
        }),
      )
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
      // 전체 발송인 경우 모든 구역 UUID 배열, 구역별 발송인 경우 선택된 구역 UUID 배열
      const areaUuids = formData.isAllTarget
        ? areas?.map((area) => area.id) || [] // 전체 선택 시 모든 구역 UUID
        : formData.targetAreas // 구역별 선택 시 선택된 구역 UUID

      const result = await noticeApi.sendNotice({
        title: formData.title,
        content: formData.content,
        areaUuids: areaUuids,
      })

      if (result.success) {
        toast.success('공지사항이 성공적으로 발송되었습니다!')
        setShowSendForm(false)
      } else {
        setSendError(result.message || '공지사항 발송에 실패했습니다.')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '공지사항 발송에 실패했습니다.'
      setSendError(errorMessage)
      toast.error('공지사항 발송에 실패했습니다.')
      console.error('공지사항 발송 실패:', error)
    } finally {
      setIsSending(false)
    }
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
          {notifications.length > 0 && (
            <div css={buttonContainer}>
              <button onClick={clearNotifications} css={clearAllButton}>
                <MdOutlineClose className="icon" />
                <span className="text">모두 지우기</span>
              </button>
            </div>
          )}
        </div>

        {/* 에러 표시 */}
        {error && (
          <div css={errorCard}>
            <div css={errorIcon}>⚠️</div>
            <div css={errorText}>{error}</div>
          </div>
        )}

        {/* 알림 목록 (공지사항 제외) */}
        <div css={notificationsContainer}>
          {notifications.filter(
            (notification) => notification.data?.type !== 'ANNOUNCEMENT',
          ).length > 0 ? (
            <div css={notificationList}>
              {notifications
                .filter(
                  (notification) => notification.data?.type !== 'ANNOUNCEMENT',
                )
                .map((notification) => (
                  <div key={notification.id} css={noticeItemWithHover}>
                    <NotificationItem
                      notification={notification}
                      timestamp={new Date(
                        notification.timestamp || '',
                      ).toLocaleTimeString()}
                      onClick={() => handleNotificationClick(notification)}
                    />
                    <button
                      css={deleteButton}
                      onClick={() => removeNotification(notification.id)}
                      title="알림 삭제"
                    >
                      <MdOutlineClose />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div css={emptyState}>
              <p css={emptyNoticeText}>
                {isRegistered
                  ? '새로운 알림이 없습니다'
                  : '알림을 활성화해주세요'}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* 공지사항 섹션 */}
      <div css={noticeSection}>
        <div css={tabContainer}>
          <div>
            <button
              css={[tabButton, !showSendForm && activeTabButton]}
              onClick={() => setShowSendForm(false)}
            >
              공지 목록
            </button>
            <button
              css={[tabButton, showSendForm && activeTabButton]}
              onClick={() => {
                setShowSendForm(true)
                if (areas.length === 0) {
                  loadAreas()
                }
              }}
            >
              공지 발송
            </button>
          </div>
          {notices.length > 0 && (
            <div css={buttonContainer}>
              <button onClick={clearNotices} css={clearAllButton}>
                <MdOutlineClose className="icon" />
                <span className="text">모두 지우기</span>
              </button>
            </div>
          )}
        </div>

        <div css={noticeContentContainer}>
          {showSendForm ? (
            <>
              <NoticeSendForm
                areas={areas}
                onSubmit={handleSendNotice}
                isLoading={isSending}
              />
              {sendError && <div css={errorMessage}>{sendError}</div>}
            </>
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
                      <MdOutlineClose />
                    </button>
                  </div>
                ))
              ) : (
                <div css={emptyState}>
                  <div css={emptyNoticeText}>공지사항이 없습니다</div>
                </div>
              )}
            </div>
          )}
        </div>
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
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const notificationSection = css`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-bottom: 1px solid var(--color-gray-400);
`

const sectionHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
`

const sectionTitle = css`
  padding: 0.5rem 1rem;
  font-size: 16px;
  font-weight: 500;
  font-family: 'PretendardRegular';
`

const buttonSection = css`
  display: flex;
  align-items: center;
`

const primaryButton = css`
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--color-primary);
  background-color: white;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-0.5px);
    box-shadow: var(--color-gray-500);
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
  padding: 0 0.25rem;
`

const clearAllButton = css`
  position: relative;
  background-color: white;
  border: 1px solid var(--color-red);
  border-radius: 20px;
  cursor: pointer;

  color: var(--color-red);

  width: 20px;
  height: 20px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  white-space: nowrap;

  transition: all 0.4s ease-in-out;

  .icon {
    position: absolute;
    font-size: 14px;
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .text {
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    width: 80px;

    .icon {
      opacity: 0;
    }

    .text {
      opacity: 1;
    }
  }
`

const notificationsContainer = css`
  flex: 1;
  overflow-y: auto;

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

const notificationList = css`
  display: flex;
  flex-direction: column;
`

const emptyState = css`
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg-white);
  height: 100%;
`

const noticeSection = css`
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const noticeContentContainer = css`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

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

const noticeList = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
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

const emptyNoticeText = css`
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-gray-500);
`

const deleteButton = css`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: transparent;
  color: var(--color-gray-600);
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
`

const noticeItemWithHover = css`
  display: flex;
  align-items: flex-start;
  padding: 0.5rem;
  background: var(--color-bg-white);
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 0;
  gap: 1rem;
  position: relative;

  &:hover button {
    opacity: 1;
  }
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

const tabContainer = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid transparent;
`

const tabButton = css`
  padding: 0.75rem 1.25rem;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-gray-600);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-bottom: -1px;

  &:hover {
    color: #000;
    background-color: var(--color-gray-100);
  }
`

const activeTabButton = css`
  color: #000;
  border-bottom: 1px solid #000;
`

export default NotificationPanel
