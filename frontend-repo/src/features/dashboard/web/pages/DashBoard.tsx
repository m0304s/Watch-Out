import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import AreaFilter from '@/components/common/AreaFilter'
import { areaAPI } from '@/features/area/services/area'
import type { AreaListItem, AreaListResponse } from '@/features/area/types/area'
import SafetyScore from '@/features/dashboard/web/components/SafetyScore'
import Violation from '@/features/dashboard/web/components/Violation'
import Worker from '@/features/dashboard/web/components/Worker'
import Accident from '@/features/dashboard/web/components/Accident'

const DashBoard = () => {
  const [areaCount, setAreaCount] = useState<number>(0) // 구역 총 개수
  const [selectedArea, setSelectedArea] = useState<AreaListItem | 'all' | null>(
    'all',
  )
  const [areaList, setAreaList] = useState<AreaListResponse | null>(null)

  const handleSelectAllArea = () => {
    setSelectedArea('all')
  }

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
          <div css={filterContainer}>
            <button
              css={[button, selectedArea === 'all' && activeButtonStyle]}
              onClick={handleSelectAllArea}
            >
              전체
            </button>
            <AreaFilter
              areaList={areaList.data}
              selectedArea={selectedArea}
              onAreaChange={handleAreaChange}
            />
          </div>
          <div css={topCardsContainer}>
            <div css={card}>
              <SafetyScore area={selectedArea} areaList={areaList} />
            </div>
            <div css={card}>
              <Worker area={selectedArea} areaList={areaList} />
            </div>
            <div css={card}>
              <Violation area={selectedArea} areaList={areaList} />
            </div>
          </div>
          <div css={bottomCardContainer}>
            <div css={largeCard}>
              <Accident area={selectedArea} areaList={areaList} />
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
  display: flex;
  flex-direction: column;
`

const filterContainer = css`
  display: flex;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #dfe1e2;
`

const button = css`
  border: none;
  outline: none;
  background-color: inherit;
  cursor: pointer;
  border: 1px solid var(--color-gray-500);
  border-radius: 25px;
  padding: 0.1rem 1rem;
  color: var(--color-gray-500);
  margin: 0.5rem 1rem 0.5rem 0;
`

const activeButtonStyle = css`
  border: 1px solid var(--color-primary);
  background-color: var(--color-secondary);
  color: var(--color-primary);
`

const topCardsContainer = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 24px;
`

const bottomCardContainer = css`
  width: 100%;
`

const card = css`
  flex-grow: 1;
  background: #f8f8f8;
  border-radius: 20px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin: 0 1rem;
  display: flex;
  flex-direction: column;
  height: 300px;
`

const largeCard = css`
  background: #f8f8f8;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  padding: 24px;
  min-height: 400px;
  width: 100%;
`
