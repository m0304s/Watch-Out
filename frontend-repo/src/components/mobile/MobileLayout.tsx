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
  hideBottomNav
}: MobileLayoutProps) => {
  return (
    <div css={containerStyles}>
      <MobileHeader title={title} showBack={showBack} backTo={backTo} rightSlot={rightSlot} />

      <main css={contentStyles}>{children}</main>

      {!hideBottomNav && <MobileBottomNavigation />}
    </div>
  )
}

const containerStyles = css`
  min-height: 100dvh;
  background-color: var(--color-gray-50);
  display: grid;
  grid-template-rows: 60px 1fr 60px;
`

const contentStyles = css`
  background-color: var(--color-bg-white);
`