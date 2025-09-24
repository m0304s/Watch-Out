import { css } from '@emotion/react'
import { useRef } from 'react'
import { BaseModal } from '@/components/common/Modal'
import type { CctvViewAreaItem } from '@/features/area/types/cctv'

interface CctvModalProps {
  cctv: CctvViewAreaItem | null
  onClose: () => void
}

const MobileCctvModal = ({ cctv, onClose }: CctvModalProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://j13e102.p.ssafy.io:8443/api'
  const modalRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      <BaseModal
        isOpen={!!cctv}
        onClose={onClose}
        variant="cctv"
        size="fullscreen"
      >
        {cctv && (
          <div css={layout} onClick={onClose}>
            <div css={modalContentWrapper} ref={modalRef}>
              <div css={container}>
                <div css={iframeWrapper}>
                  <img
                    css={iFrameBox}
                    src={`${API_BASE_URL}${cctv.springProxyUrl}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  )
}

export default MobileCctvModal

const layout = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  cursor: pointer;
`

const modalContentWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const container = css`
  width: 100%;
  padding: 0;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`

const iframeWrapper = css`
  position: relative;
  padding-top: 56.25%;
`

const iFrameBox = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`
