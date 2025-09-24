export interface FCMTokenRequest {
  token: string
}

export interface FCMTokenResponse {
  tokens: FCMTokenInfo[]
}

export interface FCMTokenInfo {
  uuid: string
  fcmToken: string
  createdAt: string
  updatedAt: string
}

export interface NoticeMessage {
  id: string
  title: string
  content: string
  timestamp: string
  sender: string
}

export interface NotificationMessage {
  id: string
  title: string
  body: string
  imageUrl?: string
  timestamp: string
  data?: {
    areaName?: string
    cctvName?: string
    violationTypes?: string
    heavyEquipmentTypes?: string
    type?: string
    violationUuid?: string
    imageUrl?: string
    // 사고 신고 관련 필드
    accidentType?: string
    reporterName?: string
    companyName?: string
    accidentUuid?: string
    // 공지사항 관련 필드
    sender?: string
    content?: string
    areaUuid?: string
    // 안면인식 관련 필드
    userName?: string
    entryType?: string
    timestamp?: string
  }
}

/**
 * FCM 메시지 페이로드 타입 정의
 */
export interface FCMPayload {
  notification?: {
    title?: string
    body?: string
    image?: string
  }
  data?: {
    id?: string
    type?: string
    title?: string
    body?: string
    image?: string
    timestamp?: string
    areaName?: string
    cctvName?: string
    violationTypes?: string
    heavyEquipmentTypes?: string
    violationUuid?: string
    imageUrl?: string
    // 사고 신고 관련 필드
    accidentType?: string
    reporterName?: string
    companyName?: string
    accidentUuid?: string
    // 공지사항 관련 필드
    sender?: string
    areaUuid?: string
    // 안면인식 관련 필드
    userName?: string
    entryType?: string
  }
  title?: string
  body?: string
  image?: string
}

/**
 * 고유한 알림 ID를 생성하는 함수
 */
export const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
