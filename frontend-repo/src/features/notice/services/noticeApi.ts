import { apiClient } from '@/api/client'
import type { Notice, NoticeSendRequest } from '@/features/notice/types'

// ===== 요청 타입 정의 =====
export interface NoticeListRequest {
  // 공지사항 목록 조회 요청 (필요시 페이지네이션 등 추가)
  page?: number
  limit?: number
}

export interface NoticeDeleteRequest {
  noticeId: string
}

// ===== 응답 타입 정의 =====
export interface NoticeListResponse {
  notices: Notice[]
  totalCount?: number
  currentPage?: number
  totalPages?: number
}

export interface NoticeSendResponse {
  success: boolean
  message: string
  data?: {
    noticeId: string
    sentAt: string
  }
}

export interface NoticeDeleteResponse {
  success: boolean
  message: string
}

export interface AreaListResponse {
  areas: Array<{
    id: string
    name: string
  }>
}

// ===== API 서비스 =====
export const noticeApi = {
  // 공지사항 목록 조회
  getNotices: async (
    params?: NoticeListRequest,
  ): Promise<NoticeListResponse> => {
    const response = await apiClient.get('/announcements/my', { params })
    const data = response.data.data || response.data

    return {
      notices: Array.isArray(data) ? data : [],
      totalCount: response.data.totalCount,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
    }
  },

  // 공지사항 발송
  sendNotice: async (data: NoticeSendRequest): Promise<NoticeSendResponse> => {
    // 공지사항 발송 시 알림 타입을 포함
    const requestData = {
      ...data,
      notificationType: 'announcement', // 공지사항은 파란색 알림
    }

    const response = await apiClient.post('/announcements', requestData)
    console.log('공지사항 발송 응답:', response.data) // 디버깅용

    // API 응답이 배열인 경우 성공으로 처리
    if (Array.isArray(response.data)) {
      return {
        success: true,
        message: '공지사항이 성공적으로 발송되었습니다.',
        data: {
          noticeId: `notice_${Date.now()}`,
          sentAt: new Date().toISOString(),
        },
      }
    }

    // 기존 구조 유지
    return response.data
  },

  // 공지사항 삭제
  deleteNotice: async (
    params: NoticeDeleteRequest,
  ): Promise<NoticeDeleteResponse> => {
    const response = await apiClient.delete(`/notices/${params.noticeId}`)
    return response.data
  },

  // 구역 목록 조회
  getAreas: async (): Promise<AreaListResponse> => {
    const response = await apiClient.get('/area')
    const data = response.data.data || response.data

    // 구역 데이터 구조에 따라 매핑
    const areas = data.map((area: any, index: number) => ({
      id:
        area.areaUuid ||
        area.uuid ||
        area.id ||
        area.areaId ||
        area.area_id ||
        `area-${index}`,
      name: area.areaName || area.name || area.area_name || `구역 ${index + 1}`,
    }))

    return { areas }
  },
}
