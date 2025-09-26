import { css } from '@emotion/react'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { MobileBottomNavigation } from '@/components/mobile/MobileBottomNavigation'

interface MobileLayoutProps {
  title: string
  showBack?: boolean
  backTo?: string
  rightSlot?: React.ReactNode
  children: React.ReactNode
  hideBottomNav?: boolean
}

export const MobileLayout = ({
  title,
  showBack,
  backTo,
  rightSlot,
  children,
  hideBottomNav,
}: MobileLayoutProps) => {
  return (
    <div css={containerStyles}>
      <MobileHeader
        title={title}
        showBack={showBack}
        backTo={backTo}
        rightSlot={rightSlot}
      />

      <main css={contentStyles}>{children}</main>

      {!hideBottomNav && <MobileBottomNavigation />}
    </div>
  )
}

const containerStyles = css`
  min-height: 100dvh;
  background-color: var(--color-gray-50);
  display: flex;
  flex-direction: column;

  /* 헤더가 고정되므로 메인 콘텐츠에 상단 여백 추가 */
  padding-top: 60px;

  /* 하단 네비게이션 바가 고정되므로 메인 콘텐츠에 하단 여백 추가 */
  padding-bottom: 108px; /* 네비게이션 바 높이(60px) + 갤럭시 버튼 영역(48px) */

  /* 갤럭시 기기에서의 최적화 */
  @supports (padding-top: env(safe-area-inset-top)) {
    padding-top: calc(60px + env(safe-area-inset-top));
  }

  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: calc(60px + env(safe-area-inset-bottom) + 48px);
  }
`

const contentStyles = css`
  background-color: var(--color-bg-white);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS에서 부드러운 스크롤 */
`
