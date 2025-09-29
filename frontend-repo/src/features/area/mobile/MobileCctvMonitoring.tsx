import { css } from '@emotion/react'
import { useState, useEffect, type ChangeEvent } from 'react'
import type { AreaListItem } from '@/features/area/types/area'
import type { CctvViewAreaItem } from '@/features/area/types/cctv'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import { MobileUser } from '@/components/mobile'
import { areaAPI } from '@/features/area/services/area'
import { cctvAPI } from '@/features/area/services/cctv'
import MobileCctvModal from '@/features/area/mobile/MobileCctvModal'
import { useToast } from '@/hooks/useToast'

const MobileCctvMonitoring = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://j13e102.p.ssafy.io:8443/api'
  const toast = useToast()
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [areaList, setAreaList] = useState<AreaListItem[]>([])
  const [cctvList, setCctvList] = useState<CctvViewAreaItem[] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedCctv, setSelectedCctv] = useState<CctvViewAreaItem | null>(
    null,
  )

  const handleAreaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedArea(event.target.value)
  }

  const handleCctvClick = (cctv: CctvViewAreaItem) => {
    setSelectedCctv(cctv)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedCctv(null)
    setIsModalOpen(false)
  }

  useEffect(() => {
    const fetchAreaList = async () => {
      try {
        const countResponse = await areaAPI.getAreaCount()
        const areaResponse = await areaAPI.getAreaList({
          pageNum: 0,
          display: countResponse.areaCount,
        })

        if (areaResponse.data && areaResponse.data.length > 0) {
          setAreaList(areaResponse.data)
          if (!selectedArea) {
            setSelectedArea(areaResponse.data[0].areaUuid)
          }
        }
      } catch (err) {
        toast.error('구역 목록을 가져오는 데 실패했습니다.')
        console.error('구역 목록 조회 에러:', err)
      }
    }
    fetchAreaList()
  }, [])

  useEffect(() => {
    if (selectedArea) {
      const fetchCctvList = async () => {
        try {
          const cctvResponse = await cctvAPI.getCctvViewArea({
            areaUuid: selectedArea,
            useFastapiMjpeg: true,
          })
          setCctvList(cctvResponse.items)
        } catch (err) {
          toast.error('CCTV 목록을 가져오는 데 실패했습니다.')
          console.error('CCTV 조회 에러:', err)
        }
      }
      fetchCctvList()
    }
  }, [selectedArea])

  return (
    <MobileLayout title="현장 관리" rightSlot={<MobileUser />}>
      <div css={container}>
        <div css={sectionTitle}>구역별 CCTV 영상</div>
        <div>
          <select
            css={dropdownStyle}
            value={selectedArea}
            onChange={handleAreaChange}
          >
            {areaList.length === 0 && <option>로딩 중...</option>}
            {areaList.map((area) => (
              <option key={area.areaUuid} value={area.areaUuid}>
                {area.areaName}
              </option>
            ))}
          </select>
        </div>
        <div css={cctvListContainer}>
          {cctvList &&
            cctvList.map((cctv) => (
              <div
                key={cctv.uuid}
                css={cctvItem}
                onClick={() => handleCctvClick(cctv)}
              >
                <img
                  src={`${API_BASE_URL}${cctv.springProxyUrl}`}
                  css={cctvImage}
                />
                <div css={cctvInfo}>
                  <span css={cctvName}>{cctv.name}</span>
                  {cctv.online && (
                    <div css={liveIndicator}>
                      <span css={liveDot}></span>
                      LIVE
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      {isModalOpen && (
        <MobileCctvModal cctv={selectedCctv} onClose={handleCloseModal} />
      )}
    </MobileLayout>
  )
}

export default MobileCctvMonitoring

const container = css`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const sectionTitle = css`
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
`

const dropdownStyle = css`
  width: 100%;
  padding: 10px 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 1rem;
`

const cctvListContainer = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const cctvItem = css`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`

const cctvImage = css`
  width: 90px;
  height: 68px;
  background-color: #343a40;
  border-radius: 4px;
  margin-right: 12px;
  object-fit: cover;
`

const cctvInfo = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

const cctvName = css`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`

const liveIndicator = css`
  display: inline-flex;
  align-items: center;
  color: var(--color-red);
  font-size: 0.9rem;
  font-weight: bold;
`

const liveDot = css`
  width: 7px;
  height: 7px;
  background-color: var(--color-red);
  border-radius: 50%;
  margin-right: 4px;
`
