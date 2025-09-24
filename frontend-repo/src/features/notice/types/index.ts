export interface Notice {
  announcementUuid: string
  title: string
  content: string
  senderName: string
  receiverName: string
  createdAt: string
  status: 'draft' | 'sent' | 'scheduled'
}

export interface Area {
  id: string
  name: string
  isSelected: boolean
}

export interface NoticeFormData {
  title: string
  content: string
  targetAreas: string[]
  isAllTarget: boolean
}

export interface NoticeSendRequest {
  title: string
  content: string
  areaUuids: string[]
}
