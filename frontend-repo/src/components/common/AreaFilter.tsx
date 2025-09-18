import { css } from '@emotion/react'
import type { AreaListItem } from '@/features/area/types/area'

interface AreaFilterProps {
  areaList: AreaListItem[]
  selectedArea: AreaListItem
  onAreaChange: (area: AreaListItem) => void
}

const AreaFilter: React.FC<AreaFilterProps> = ({
  areaList,
  selectedArea,
  onAreaChange,
}) => {
  return (
    <div css={container}>
      {areaList.map((area) => (
        <div key={area.areaUuid}>
          <button
            onClick={() => onAreaChange(area)}
            css={[
              button,
              selectedArea.areaUuid === area.areaUuid && activeButtonStyle,
            ]}
          >
            {area.areaName}
          </button>
        </div>
      ))}
    </div>
  )
}

export default AreaFilter

const container = css`
  display: flex;
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
