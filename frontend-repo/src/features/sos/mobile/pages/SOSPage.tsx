import { css } from '@emotion/react'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import { MobileUser } from '@/components/mobile'
import { useToast } from '@/hooks/useToast'
import { useAccident } from '@/features/sos/hooks/useAccident'

export const SOSPage = () => {
  const toast = useToast()
  const { reportAccident, isLoading, error } = useAccident()

  const handleSendSOS = async () => {
    try {
      const response = await reportAccident()
      // 200 응답이 오면 성공으로 처리
      toast.success('SOS가 전송되었습니다.')
      console.log('SOS 신고 성공:', response)
    } catch (err) {
      console.error('SOS 전송 오류:', err)
      toast.error('SOS 전송 중 오류가 발생했습니다.')
    }
  }

  return (
    <MobileLayout title="SOS" showBack rightSlot={<MobileUser />}>
      <div css={container}>
        <div css={imageContainer}>
          <div
            css={[sosButton, isLoading && loadingButton]}
            onClick={handleSendSOS}
          >
            <div css={sosText}>{isLoading ? '전송중...' : 'SOS'}</div>
          </div>
        </div>
        {error && <div css={errorText}>{error}</div>}
      </div>
    </MobileLayout>
  )
}

const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 0;
  background-color: #fafafc;
`

const imageContainer = css`
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const sosButton = css`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 0 0 8px rgba(239, 68, 68, 0.3),
    0 0 0 16px rgba(252, 165, 165, 0.2),
    0 0 0 24px rgba(254, 202, 202, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #b91c1c;
    box-shadow:
      0 0 0 12px rgba(239, 68, 68, 0.4),
      0 0 0 20px rgba(252, 165, 165, 0.3),
      0 0 0 28px rgba(254, 202, 202, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`

const loadingButton = css`
  background-color: #9ca3af;
  cursor: not-allowed;

  &:hover {
    background-color: #9ca3af;
    transform: none;
  }
`

const sosText = css`
  color: #ffffff;
  font-family: 'PretendardBold', sans-serif;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  letter-spacing: 1px;
`

const errorText = css`
  color: #dc2626;
  font-size: 14px;
  margin-top: 16px;
  text-align: center;
  padding: 0 20px;
`
