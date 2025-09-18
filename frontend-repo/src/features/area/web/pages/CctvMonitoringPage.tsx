import { useState, useEffect } from 'react'
import type { AreaListResponse, AreaListItem } from '@/features/area/types/area'
import type { CctvViewAreaItem } from '@/features/area/types/cctv'
import { areaAPI } from '@/features/area/services/area'
import AreaFilter from '@/components/common/AreaFilter'
import CctvList from '@/features/area/web/components/CctvList'
import Pagination from '@/features/area/web/components/Pagination'
import AreaInfo from '@/features/area/web/components/AreaInfo'
import CctvModal from '@/features/area/web/components/CctvModal'

const CctvMonitoringPage = () => {
  const [areaCount, setAreaCount] = useState<number>(0) // 구역 총 개수
  const [areaList, setAreaList] = useState<AreaListResponse | null>(null)
  const [selectedArea, setSelectedArea] = useState<AreaListItem | null>(null)
  const [cctvCount, setCctvCount] = useState<number>(0) // 선택된 구역의 cctv 총 개수
  const [pageNum, setPageNum] = useState<number>(0) // 현재 페이지
  const ITEM_PER_PAGE = 4
  const [selectedCctv, setSelectedCctv] = useState<CctvViewAreaItem | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

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

  useEffect(() => {
    setPageNum(0)
  }, [selectedArea]) // 다른 구역 선택 시 페이지 번호 0으로 초기화

  const handleAreaChange = (area: AreaListItem) => {
    setSelectedArea(area)
  }

  const handleCctvClick = (cctv: CctvViewAreaItem) => {
    setSelectedCctv(cctv)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedCctv(null)
    setIsModalOpen(false)
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
          <CctvList
            selectedArea={selectedArea}
            pageNum={pageNum}
            setCctvCount={setCctvCount}
            itemPerPage={ITEM_PER_PAGE}
            onCctvClick={handleCctvClick}
          />
          <Pagination
            pageNum={pageNum}
            totalCount={cctvCount}
            itemPerPage={ITEM_PER_PAGE}
            onPageChange={setPageNum}
          />
          <AreaInfo selectedArea={selectedArea} />
        </>
      ) : (
        <div>담당 구역이 존재하지 않습니다.</div>
      )}
      {isModalOpen && (
        <CctvModal cctv={selectedCctv} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default CctvMonitoringPage
