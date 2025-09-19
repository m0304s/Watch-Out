import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import AreaFilter from '@/components/common/AreaFilter'
import { areaAPI } from '@/features/area/services/area'
import type { AreaListItem, AreaListResponse } from '@/features/area/types/area'
import SafetyScore from '@/features/dashboard/web/components/SafetyScore'
import Violation from '@/features/dashboard/web/components/Violtaion'
import Accident from '@/features/dashboard/web/components/Accident'

const DashBoard = () => {
  const [areaCount, setAreaCount] = useState<number>(0) // 구역 총 개수
  const [selectedArea, setSelectedArea] = useState<AreaListItem | null>(null)
  const [areaList, setAreaList] = useState<AreaListResponse | null>(null)

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const countResponse = await areaAPI.getAreaCount()
        const fetchCount = countResponse.areaCount
        setAreaCount(fetchCount)

        if (fetchCount > 0) {
          const areaResponse = await areaAPI.getAreaList({
            display: areaCount,
            pageNum: 0,
          })
          setAreaList(areaResponse)

          if (areaResponse && areaResponse.data.length > 0) {
            setSelectedArea(areaResponse.data[0]) // 목록을 받아온 후 첫번째 구역을 임의로 지정
          }
        }
      } catch (error) {
        console.log('구역 개수', error)
      }
    }
    fetchArea()
  }, [])

  const handleAreaChange = (area: AreaListItem) => {
    setSelectedArea(area)
  }
  return (
    <div css={dashboardContainer}>
      {areaList && selectedArea ? (
        <>
          <AreaFilter
            areaList={areaList.data}
            selectedArea={selectedArea}
            onAreaChange={handleAreaChange}
          />
          <div css={topCardsContainer}>
            <div css={card}>
              <SafetyScore area={selectedArea} />
            </div>
            <div css={card}>
              <div css={cardTitle}>작업 인원</div>
              <div css={cardContent}></div>
            </div>
            <div css={card}>
              <Violation area={selectedArea} />
            </div>
          </div>
          <div css={bottomCardContainer}>
            <div css={largeCard}>
              <Accident area={selectedArea} />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

export default DashBoard

const dashboardContainer = css`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`

const topCardsContainer = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
`

const bottomCardContainer = css`
  width: 100%;
`

const card = css`
  background: white;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 24px;
  height: 320px;
  display: flex;
  flex-direction: column;
`

const largeCard = css`
  background: white;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 24px;
  min-height: 400px;
  width: 100%;
`

const cardTitle = css`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
`

const cardContent = css`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`
