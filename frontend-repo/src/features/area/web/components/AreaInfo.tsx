import { css } from '@emotion/react'
import { useState, useEffect } from 'react'
import type { AreaListItem } from '@/features/area/types/area'
import { areaAPI } from '@/features/area/services/area'

interface AreaInfoProps {
  selectedArea: AreaListItem
}

const AreaInfo: React.FC<AreaInfoProps> = ({ selectedArea }) => {
  const [manager, setManager] = useState<string | null>(null)

  useEffect(() => {
    const fetchAreaDetail = async () => {
      try {
        const areaDetail = await areaAPI.getArea({
          areaUuid: selectedArea.areaUuid,
          pageNum: 0,
          display: 1,
        })
        const areaManager = areaDetail.managerName
        if (areaManager) {
          setManager(areaManager)
        }
      } catch (error) {
        console.log('구역 관리자', error)
      }
    }
    fetchAreaDetail()
  }, [selectedArea])

  return (
    <div>
      <p css={title}>구역 정보</p>
      <div css={contentBox}>
        <p css={subTitle}>구역 이름</p>
        <p>{selectedArea.areaName}</p>
      </div>
      <div css={contentBox}>
        <p css={subTitle}>구역 별칭</p>
        <p>{selectedArea.areaAlias}</p>
      </div>
      <div css={contentBox}>
        <p css={subTitle}>관리자 정보</p>
        {manager ? <p>{manager}</p> : <p css={noManager}>정보 없음</p>}
      </div>
    </div>
  )
}

export default AreaInfo

const title = css`
  font-size: 18px;
`

const contentBox = css`
  display: flex;
  margin: 1rem 0;
`

const subTitle = css`
  width: 7em;
`

const noManager = css`
  color: var(--color-gray-400);
`
