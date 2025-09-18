import { useEffect, useState } from 'react'
import AreaFilter from '@/components/common/AreaFilter'
import { areaAPI } from '@/features/area/services/area'
import type { AreaListItem, AreaListResponse } from '@/features/area/types/area'
import Safety from '@/features/dashboard/web/components/SafetyScore'

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
    <div>
      {areaList && selectedArea ? (
        <>
          <AreaFilter
            areaList={areaList.data}
            selectedArea={selectedArea}
            onAreaChange={handleAreaChange}
          />
          <Safety area={selectedArea} />
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

export default DashBoard
