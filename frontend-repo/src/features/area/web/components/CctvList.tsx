import { css } from '@emotion/react'
import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { TbCancel } from 'react-icons/tb'
import { cctvAPI } from '@/features/area/services/cctv'
import type { AreaListItem } from '@/features/area/types/area'
import type { CctvViewAreaItem } from '@/features/area/types/cctv'

interface CctvListProps {
  selectedArea: AreaListItem
  pageNum: number
  setCctvCount: Dispatch<SetStateAction<number>>
  itemPerPage: number
  onCctvClick: (cctv: CctvViewAreaItem) => void
}

const CctvList: React.FC<CctvListProps> = ({
  selectedArea,
  pageNum,
  setCctvCount,
  itemPerPage,
  onCctvClick,
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const [cctvList, setCctvList] = useState<CctvViewAreaItem[] | null>(null)

  useEffect(() => {
    const getCctvList = async () => {
      try {
        const cctvResponse = await cctvAPI.getCctvList({
          areaUuid: selectedArea.areaUuid,
          pageNum: pageNum,
          display: itemPerPage,
          isOnline: true,
        })
        const cctvViewResponse = await cctvAPI.getCctvViewArea({
          areaUuid: selectedArea.areaUuid,
          useFastapiMjpeg: true,
        })
        const fetchCctv = cctvResponse
        if (fetchCctv) {
          setCctvCount(fetchCctv.pagination.totalItems) // 선택된 구역의 cctv 총 개수
        }
        const viewCctv: CctvViewAreaItem[] = cctvViewResponse.items // cctv 스트리밍 목록
        if (viewCctv) {
          setCctvList(viewCctv)
        }
      } catch (error) {
        console.log('cctv 목록 조회', error)
      }
    }
    getCctvList()
  }, [selectedArea, pageNum])

  return (
    <div css={container}>
      {Array.from({ length: itemPerPage }).map((_, index) => {
        const cctv = cctvList?.[index]
        if (cctv) {
          return (
            <div key={cctv.uuid} css={cell}>
              <img
                css={iFrameBox}
                src={`${API_BASE_URL}${cctv.springProxyUrl}`}
              ></img>
              <div css={labelBox}>
                <p>{cctv.name}</p>
              </div>
              <div css={overlay} onClick={() => onCctvClick(cctv)}></div>
            </div>
          )
        }

        return (
          <div key={`placeholder-${index}`} css={[cell, emptyCell]}>
            <p>
              <TbCancel size={50} />
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default CctvList

const container = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  box-sizing: border-box;
  margin: 1rem 0 2rem 0;
`

const cell = css`
  position: relative;
  padding-top: 56.25%;
  border: 1px solid #222;
  overflow: hidden;
`

const overlay = css`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  cursor: pointer;
  z-index: 1;
`

const iFrameBox = css`
  border: 1px solid blue;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 10px;
`

const labelBox = css`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.5rem 0.5rem;
  color: #fff;
`

const emptyCell = css`
  background-color: #141010;
  color: #555;
  font-size: 0.9rem;
  display: flex;
  justify-content: center;
  align-items: center;

  & > p {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`
