import { useState, useEffect, useCallback } from 'react'
import { noticeApi } from '@/features/notice/services/noticeApi'
import type { Notice, Area, NoticeSendRequest } from '@/features/notice/types'
import type { NoticeListResponse, NoticeSendResponse, NoticeDeleteResponse, AreaListResponse } from '@/features/notice/services/noticeApi'

interface UseNoticeState {
  notices: Notice[]
  areas: Area[]
  isLoading: boolean
  error: string | null
}

export const useNotice = () => {
  const [notices, setNotices] = useState<Notice[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 공지사항 목록 조회
  const fetchNotices = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response: NoticeListResponse = await noticeApi.getNotices()
      setNotices(response.notices)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '공지사항을 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('공지사항 조회 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 구역 목록 조회
  const fetchAreas = useCallback(async () => {
    try {
      const response: AreaListResponse = await noticeApi.getAreas()
      setAreas(response.areas.map(area => ({ ...area, isSelected: false })))
    } catch (err) {
      console.error('구역 목록 조회 실패:', err)
      // 기본 구역 데이터 사용
      setAreas([
        { id: 'area-a', name: '구역 A', isSelected: false },
        { id: 'area-b', name: '구역 B', isSelected: false },
        { id: 'area-c', name: '구역 C', isSelected: false },
        { id: 'area-d', name: '구역 D', isSelected: false }
      ])
    }
  }, [])

  // 공지사항 발송
  const sendNotice = useCallback(async (data: NoticeSendRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response: NoticeSendResponse = await noticeApi.sendNotice(data)

      if (response.success) {
        // 성공 시 목록 새로고침
        await fetchNotices()
        return { success: true, message: response.message }
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '공지사항 발송에 실패했습니다.'
      setError(errorMessage)
      console.error('공지사항 발송 실패:', err)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [fetchNotices])

  // 공지사항 삭제
  const deleteNotice = useCallback(async (noticeId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response: NoticeDeleteResponse = await noticeApi.deleteNotice({ noticeId })

      if (response.success) {
        // 성공 시 목록에서 제거
        setNotices(prev => prev.filter(notice => notice.id !== noticeId))
        return { success: true, message: response.message }
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '공지사항 삭제에 실패했습니다.'
      setError(errorMessage)
      console.error('공지사항 삭제 실패:', err)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    fetchNotices()
    fetchAreas()
  }, [fetchNotices, fetchAreas])

  return {
    notices,
    areas,
    isLoading,
    error,
    fetchNotices,
    sendNotice,
    deleteNotice,
    clearError: () => setError(null)
  }
}
