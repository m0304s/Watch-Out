import { css } from '@emotion/react'
import { useRef } from 'react'
import { BaseModal } from '@/components/common/Modal'
import type { CctvViewAreaItem } from '@/features/area/types/cctv'

interface CctvModalProps {
  cctv: CctvViewAreaItem | null
  onClose: () => void
}

const CctvModal: React.FC<CctvModalProps> = ({ cctv, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://j13e102.p.ssafy.io:8443/api'

  return (
    <BaseModal
      isOpen={!!cctv}
      onClose={onClose}
      variant="cctv"
      size="fullscreen"
    >
      {cctv && (
        <div css={layout}>
          <div css={modalContentWrapper} ref={modalRef}>
            <div css={container}>
              <div css={iframeWrapper}>
                <img
                  css={iFrameBox}
                  src={`${API_BASE_URL}${cctv.springProxyUrl}`}
                  alt={cctv.name}
                />
              </div>
            </div>
            <div css={titleWrapper}>
              <p css={titleStyle}>{cctv.name}</p>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  )
}

export default CctvModal

const layout = css`
  display: flex;
  justify-content: center;
  align-items: center;
`
const modalContentWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 1200px;
`

const container = css`
  width: 90%;
  max-width: 1200px;
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

const titleWrapper = css`
  width: 90%;
  display: flex;
  flex-direction: row-reverse;
`
const titleStyle = css`
  padding: 16px;
  font-size: 18px;
  margin: 0;
  color: #fff;
`
