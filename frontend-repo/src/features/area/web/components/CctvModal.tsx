import { css } from '@emotion/react'
import { useCallback, useEffect, useRef } from 'react'
import type { CctvItem } from '@/features/area/types/cctv'

interface CctvModalProps {
  cctv: CctvItem | null
  onClose: () => void
}

const CctvModal: React.FC<CctvModalProps> = ({ cctv, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleCloseModal = useCallback(
    (e: MouseEvent) => {
      if (modalRef.current === null) {
        return
      }
      if (!modalRef.current.contains(e.target as HTMLElement)) {
        onClose()
      }
    },
    [onClose],
  )

  // 외부 영역 클릭 시 모달창 닫기
  useEffect(() => {
    window.addEventListener('click', handleCloseModal, true)
    return () => {
      window.removeEventListener('click', handleCloseModal, true)
    }
  }, [handleCloseModal])

  // esc 키로 모달창 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <>
      {cctv && (
        <div css={overlay}>
          <div css={modalContentWrapper} ref={modalRef}>
            <div css={container}>
              <div css={iframeWrapper}>
                <iframe
                  css={iFrameBox}
                  src={cctv.cctvUrl}
                  allow="autoplay; fullscreen"
                ></iframe>
              </div>
            </div>
            <div css={titleWrapper}>
              <p css={titleStyle}>{cctv.cctvName}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CctvModal

const overlay = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
  cursor: pointer;
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
