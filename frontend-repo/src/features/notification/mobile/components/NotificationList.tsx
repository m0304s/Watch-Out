import { useState, useEffect, useMemo } from 'react'
import { css } from '@emotion/react'
import { useFCMContext } from '@/features/notification/contexts/FCMContext'
import { useAuth } from '@/stores/authStore'
import NotificationItem from '@/features/notification/components/NotificationItem'
import ImageModal from '@/features/notification/components/ImageModal'
import ViolationDetailModal from '@/features/violation/components/ViolationDetailModal'
import AccidentReportModal from '@/features/notification/components/AccidentReportModal'
import AnnouncementModal from '@/features/notification/components/AnnouncementModal'

interface SelectedImageData {
  imageUrl: string
  title: string
  areaName?: string
  cctvName?: string
  equipmentTypes?: string
}

interface SelectedAnnouncementData {
  title: string
  content: string
  sender?: string
  timestamp?: string
  color?: string
  icon?: string
}

const NotificationList: React.FC = () => {
  console.log('🚨🚨🚨 NotificationList 컴포넌트 렌더링됨! 🚨🚨🚨')

  // 날짜 포맷팅 유틸리티 함수
  const formatTimestamp = (timestamp: string | undefined, options?: Intl.DateTimeFormatOptions) => {
    if (!timestamp) return '시간 정보 없음';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '시간 정보 없음';
    return date.toLocaleString('ko-KR', options);
  };
  
  const {
    error,
    notifications,
    isRegistered,
    removeToken,
    clearNotifications,
    removeNotification
  } = useFCMContext()

  // 사용자 권한 정보 가져오기
  const { user } = useAuth()
  const userRole = user?.userRole

  // 알림 상태 변화 감지 (디버깅)
  useEffect(() => {
    console.log('🔥🔥🔥 NotificationList - notifications 상태 변경됨! 🔥🔥🔥')
    console.log('🔥🔥🔥 현재 알림 개수:', notifications.length)
    console.log('🔥🔥🔥 현재 알림 목록:', notifications)
    console.log('🔥🔥🔥 이 로그가 나타나면 상태 변화가 감지된 것입니다! 🔥🔥🔥')
    
    // 각 알림의 상세 정보 로깅
    notifications.forEach((notification, index) => {
      console.log(`📱 알림 ${index + 1}:`, {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        timestamp: notification.timestamp,
        data: notification.data
      })
    })
  }, [notifications])

  // 권한에 따른 알림 필터링
  const filteredNotifications = useMemo(() => {
    if (!userRole) return notifications

    if (userRole === 'WORKER') {
      // 작업자: 출입 알림(FACE_RECOGNITION_SUCCESS)과 공지사항(ANNOUNCEMENT) 표시
      return notifications.filter(notification => 
        notification.data?.type === 'FACE_RECOGNITION_SUCCESS' ||
        notification.data?.type === 'ANNOUNCEMENT'
      )
    } else if (userRole === 'ADMIN' || userRole === 'AREA_ADMIN') {
      // 관리자/구역 관리자: 모든 알림 표시 (긴급 호출 + 출입 알림)
      return notifications
    }

    return notifications
  }, [notifications, userRole])

  // 섹션 제목 결정
  const sectionTitle = useMemo(() => {
    if (userRole === 'WORKER') {
      return '알림 목록'
    } else if (userRole === 'ADMIN' || userRole === 'AREA_ADMIN') {
      return '전체 알림'
    }
    return '알림 목록'
  }, [userRole])

  console.log('🚨🚨🚨 NotificationList - useFCM 훅 결과 🚨🚨🚨')
  console.log('📱 notifications 배열:', notifications)
  console.log('📱 notifications 길이:', notifications.length)
  console.log('📱 isRegistered:', isRegistered)

  // 컴포넌트 마운트/언마운트 감지
  useEffect(() => {
    console.log('🚨🚨🚨 NotificationList 컴포넌트 마운트됨! 🚨🚨🚨')
    return () => {
      console.log('🚨🚨🚨 NotificationList 컴포넌트 언마운트됨! 🚨🚨🚨')
    }
  }, [])

  // 디버깅: notifications 배열 변경 감지
  useEffect(() => {
    console.log('🚨🚨🚨 모바일 NotificationList - notifications 변경됨! 🚨🚨🚨')
    console.log('📱 현재 알림 목록 개수:', notifications.length)
    console.log('📱 현재 알림 목록:', notifications)
  }, [notifications])

  // Violation 상세 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedViolationUuid, setSelectedViolationUuid] = useState<string | null>(null)

  // 이미지 모달 상태
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false)
  const [selectedImageData, setSelectedImageData] = useState<SelectedImageData | null>(null)

  // 사고 신고 모달 상태
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState<boolean>(false)
  const [selectedAccidentData, setSelectedAccidentData] = useState<any>(null)

  // 공지사항 모달 상태
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState<boolean>(false)
  const [selectedAnnouncementData, setSelectedAnnouncementData] = useState<SelectedAnnouncementData | null>(null)

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: any) => {
    const notificationType = notification.data?.type
    const violationUuid = notification.data?.violationUuid
    const accidentUuid = notification.data?.accidentUuid
    const imageUrl = notification.data?.imageUrl || notification.imageUrl
    
    console.log('📱 알림 클릭:', notification.title)
    console.log('📱 알림 타입:', notificationType)
    console.log('📱 violationUuid:', violationUuid)
    console.log('📱 accidentUuid:', accidentUuid)
    console.log('📱 imageUrl:', imageUrl)
    
    if (notificationType === 'SAFETY_VIOLATION' && violationUuid) {
      // 안전장비 위반 알림 - 상세 모달 열기
      console.log('📱 안전장비 위반 모달 열기')
      setSelectedViolationUuid(violationUuid)
      setIsModalOpen(true)
    } else if (notificationType === 'HEAVY_EQUIPMENT' && imageUrl) {
      // 중장비 진입 알림 - 이미지 모달 열기
      console.log('📱 중장비 진입 이미지 모달 열기')
      setSelectedImageData({
        imageUrl,
        title: notification.title,
        areaName: notification.data?.areaName,
        cctvName: notification.data?.cctvName,
        equipmentTypes: notification.data?.heavyEquipmentTypes
      })
      setIsImageModalOpen(true)
    } else if (notificationType === 'ACCIDENT_REPORT') {
      // 사고 신고 알림 - 예쁜 모달로 상세 정보 표시
      console.log('📱 사고 신고 알림 클릭 - 상세 모달 열기')
      setSelectedAccidentData({
        title: notification.title,
        body: notification.body,
        areaName: notification.data?.areaName,
        accidentType: notification.data?.accidentType,
        reporterName: notification.data?.reporterName,
        companyName: notification.data?.companyName,
        timestamp: notification.timestamp
      })
      setIsAccidentModalOpen(true)
    } else if (notificationType === 'ANNOUNCEMENT') {
      // 공지사항 알림 - 예쁜 모달로 내용 표시
      console.log('📱 공지사항 알림 클릭 - 공지사항 모달 열기')
      setSelectedAnnouncementData({
        title: notification.title,
        content: notification.body || notification.data?.body || '공지사항 내용이 없습니다.',
        sender: notification.data?.sender || '관리자',
        timestamp: notification.timestamp
      })
      setIsAnnouncementModalOpen(true)
    } else if (notificationType === 'FACE_RECOGNITION_SUCCESS') {
      // 출입 알림 - 간단한 모달로 정보 표시
      console.log('📱 출입 알림 클릭 - 출입 정보 모달 열기')
      setSelectedAnnouncementData({
        title: notification.title || '출입 인증 완료',
        content: notification.body || `${notification.data?.userName || '사용자'}님이 ${notification.data?.areaName || '구역'}에 ${notification.data?.entryType === 'ENTRY' ? '출입' : '퇴실'}하였습니다.`,
        sender: '출입 관리 시스템',
        timestamp: notification.timestamp,
        color: '#00bcd4',
        icon: '🚪'
      })
      setIsAnnouncementModalOpen(true)
    } else {
      // 기타 알림 - 공지사항 모달로 표시 (범용)
      console.log('📱 기타 알림 클릭 - 기본 모달 열기')
      setSelectedAnnouncementData({
        title: notification.title || '알림',
        content: notification.body || '내용이 없습니다.',
        sender: '시스템',
        timestamp: notification.timestamp
      })
      setIsAnnouncementModalOpen(true)
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

  // 사고 신고 모달 닫기 핸들러
  const handleAccidentModalClose = () => {
    setIsAccidentModalOpen(false)
    setSelectedAccidentData(null)
  }

  // 공지사항 모달 닫기 핸들러
  const handleAnnouncementModalClose = () => {
    setIsAnnouncementModalOpen(false)
    setSelectedAnnouncementData(null)
  }

  return (
    <div css={pageContainer}>
      {/* 알림 목록 섹션 */}
      <div css={sectionContainer}>
        <div css={sectionHeader}>
          <div css={sectionTitle}>{sectionTitle}</div>
        </div>

        {error && (
          <div css={errorBanner}>
            ⚠️ {error}
          </div>
        )}

        {/* 알림 목록 */}
        <div css={notificationsList}>
          {filteredNotifications.map((notification) => {
            // 알림 타입에 따른 아이콘과 제목 결정
            const getNotificationInfo = (notification: any) => {
              const type = notification.data?.type;
              const areaName = notification.data?.areaName || '구역 정보 없음';
              
              switch (type) {
                case 'ACCIDENT_REPORT':
                  return {
                    icon: '🚨',
                    title: `구역 ${areaName} 긴급 호출`,
                    subtitle: `${notification.data?.accidentType || '사고 신고'} • 작업자 ${notification.data?.reporterName || '미상'}`,
                    color: '#d32f2f'
                  };
                case 'SAFETY_VIOLATION':
                  return {
                    icon: '⚠️',
                    title: `구역 ${areaName} 안전장비 미착용`,
                    subtitle: `${notification.data?.violationTypes || '안전장비'} • CCTV ${notification.data?.cctvName || '미상'}`,
                    color: '#ff9800'
                  };
                case 'HEAVY_EQUIPMENT':
                  return {
                    icon: '🚜',
                    title: `구역 ${areaName} 중장비 진입`,
                    subtitle: `${notification.data?.heavyEquipmentTypes || '중장비'} • CCTV ${notification.data?.cctvName || '미상'}`,
                    color: '#2196f3'
                  };
                case 'ANNOUNCEMENT':
                  return {
                    icon: '📢',
                    title: '공지사항',
                    subtitle: notification.body || '새로운 공지사항이 있습니다',
                    color: '#4caf50'
                  };
                case 'FACE_RECOGNITION_SUCCESS':
                  return {
                    icon: '🚪',
                    title: `${notification.data?.userName || '사용자'} ${notification.data?.entryType === 'ENTRY' ? '출입' : '퇴실'} 완료`,
                    subtitle: `구역 ${areaName}`,
                    color: '#00bcd4'
                  };
                default:
                  return {
                    icon: '🔔',
                    title: notification.title || '알림',
                    subtitle: notification.body || '새로운 알림이 있습니다',
                    color: '#757575'
                  };
              }
            };

            const notificationInfo = getNotificationInfo(notification);

            return (
              <div 
                key={notification.id} 
                css={[emergencyCallItem, css`border-left-color: ${notificationInfo.color};`]}
                onClick={() => handleNotificationClick(notification)}
              >
                <div css={[emergencyIcon, css`background-color: ${notificationInfo.color};`]}></div>
                <div css={callContent}>
                  <div css={callTitle}>
                    {notificationInfo.title}
                  </div>
                  <div css={callSubtitle}>
                    {notificationInfo.subtitle}
                  </div>
                  <div css={timestampText}>
                    {formatTimestamp(notification.timestamp, {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <button 
                  css={deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  title="알림 삭제"
                >
                  ×
                </button>
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div css={emptyState}>
              <div css={emptyIcon}>
                📢
              </div>
              <div css={emptyText}>
                새로운 알림이 없습니다
              </div>
            </div>
          )}
        </div>

        {/* 관리 버튼 */}
        {filteredNotifications.length > 0 && (
          <div css={actionButtonContainer}>
            <button onClick={clearNotifications} css={clearAllButton}>
              모두 지우기
            </button>
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

      {/* 사고 신고 모달 */}
      {selectedAccidentData && (
        <AccidentReportModal
          isVisible={isAccidentModalOpen}
          title={selectedAccidentData.title}
          body={selectedAccidentData.body}
          data={{
            areaName: selectedAccidentData.areaName,
            accidentType: selectedAccidentData.accidentType,
            reporterName: selectedAccidentData.reporterName,
            companyName: selectedAccidentData.companyName,
            timestamp: selectedAccidentData.timestamp
          }}
          onClose={handleAccidentModalClose}
        />
      )}

      {/* 공지사항 모달 */}
      {selectedAnnouncementData && (
        <AnnouncementModal
          isVisible={isAnnouncementModalOpen}
          title={selectedAnnouncementData.title}
          content={selectedAnnouncementData.content}
          sender={selectedAnnouncementData.sender}
          timestamp={selectedAnnouncementData.timestamp}
          color={selectedAnnouncementData.color}
          icon={selectedAnnouncementData.icon}
          onClose={handleAnnouncementModalClose}
        />
      )}
    </div>
  )
}

const container = css`
  padding: 1rem;
  background-color: var(--color-bg-white);
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
`

const header = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-gray-200);
`

const buttonGroup = css`
  display: flex;
  gap: 0.5rem;
`

const buttonStyle = css`
  padding: 0.75rem 1.25rem;
  background-color: var(--color-primary);
  color: var(--color-text-white);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`


const errorStyle = css`
  padding: 1rem;
  background-color: #fee;
  color: var(--color-red);
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 1rem;
`

const statusStyle = css`
  padding: 1rem;
  background-color: #efe;
  color: var(--color-green);
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 1rem;
`

const notificationsContainer = css`
  flex: 1;
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

const clearButtonContainer = css`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`

const clearButton = css`
  padding: 0.5rem 1rem;
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    background-color: var(--color-gray-300);
  }
`

const emptyState = css`
  text-align: center;
  color: var(--color-gray-500);
  font-size: 1rem;
  padding: 3.75rem 1.25rem;
`

const notificationItemWithHover = css`
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    button {
      opacity: 1;
    }
  }
`

const deleteButton = css`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 20px;
  height: 20px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: #ff2222;
    opacity: 1;
    transform: scale(1.1);
  }
`

// 새로운 디자인 스타일들
const pageContainer = css`
  background-color: #f8f9fa;
  padding: 0;
  height: 100%;
  min-height: 100vh;
`

const headerContainer = css`
  background-color: #4285f4;
  padding: 1rem;
  text-align: center;
`

const headerTitle = css`
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
`

const sectionContainer = css`
  background-color: #f8f9fa;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
`

const sectionHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
`

const sectionTitle = css`
  font-size: 1.1rem;
  font-weight: bold;
  color: #d32f2f;
  margin: 0;
`


const errorBanner = css`
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem 1rem;
  border-left: 4px solid #f44336;
  margin: 0 1rem;
  font-size: 0.9rem;
`

const notificationsList = css`
  padding: 0;
`

const emergencyCallItem = css`
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  margin: 0.75rem;
  background-color: #fff;
  border-radius: 8px;
  border-left: 4px solid #757575;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`

const emergencyIcon = css`
  width: 8px;
  height: 8px;
  background-color: #ff4444;
  border-radius: 50%;
  margin-right: 1rem;
  margin-top: 0.5rem;
  flex-shrink: 0;
`

const callContent = css`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const callTitle = css`
  font-weight: 600;
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`

const callSubtitle = css`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
  line-height: 1.4;
`

const timeText = css`
  color: #666;
`

const separator = css`
  margin: 0 0.5rem;
  color: #ccc;
`

const reporterText = css`
  color: #666;
`

const timestampText = css`
  font-size: 0.75rem;
  color: #999;
  align-self: flex-end;
  margin-top: auto;
`

const actionButtonContainer = css`
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
  text-align: center;
`

const clearAllButton = css`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #d32f2f;
  }
`

const emptyIcon = css`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const emptyText = css`
  font-size: 1.1rem;
  color: #666;
  font-weight: 500;
`

export default NotificationList
