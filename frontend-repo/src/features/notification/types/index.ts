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

export interface NotificationMessage {
  title: string
  body: string
  imageUrl?: string
  data?: {
    areaName?: string
    cctvName?: string
    violationTypes?: string
    type?: string
  }
}
