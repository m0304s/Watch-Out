import React from 'react'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import NotificationList from '@/features/notification/mobile/components/NotificationList'

/**
 * 모바일 알림 페이지
 * 로그인 후 접근 가능한 알림 목록 페이지
 */
export const MobileNotificationPage: React.FC = () => {
  return (
    <MobileLayout title="알림 관리">
      <NotificationList />
    </MobileLayout>
  )
}

export default MobileNotificationPage
