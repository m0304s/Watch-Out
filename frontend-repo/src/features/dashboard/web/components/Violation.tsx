import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { dashboardAPI } from '@/features/dashboard/services/dashboard'
import type { AreaListItem, AreaListResponse } from '@/features/area/types/area'
import { useToast } from '@/hooks/useToast'

interface ViolationProps {
  area: AreaListItem | 'all'
  areaList: AreaListResponse | null
}

interface violationDataType {
  helmet: number[]
  belt: number[]
  label: string[]
}

const Violation = ({ area, areaList }: ViolationProps) => {
  const { error } = useToast()
  const [violationData, setViolationData] = useState<violationDataType | null>(
    null,
  )

  useEffect(() => {
    const fetchViolation = async () => {
      try {
        let areaUuids: string[] = []
        if (areaList && area === 'all') {
          areaUuids = areaList.data.map((area) => area.areaUuid)
        } else if (area !== 'all') {
          areaUuids = [area.areaUuid]
        }
        const response = await dashboardAPI.postViolationStatus({
          areaUuids: areaUuids,
        })
        if (response) {
          const helmetData = response.days.map(
            (day) =>
              day.items.find((item) => item.violationType === 'HELMET_OFF')
                ?.count ?? 0,
          )
          const beltData = response.days.map(
            (day) =>
              day.items.find((item) => item.violationType === 'BELT_OFF')
                ?.count ?? 0,
          )
          const labelData = response.days.map((day) => day.date)
          setViolationData({
            helmet: helmetData,
            belt: beltData,
            label: labelData,
          })
        }
      } catch (err) {
        error('안전장비 미착용 api 호출 오류')
      }
    }
    fetchViolation()
  }, [area, areaList, error])

  const chart = (data: number[], labels: string[]) => ({
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0],
    },
    title: {
      text: null,
    },
    subtitle: {
      text: null,
    },
    xAxis: {
      visible: false,
    },
    yAxis: {
      visible: false,
      minPadding: 0,
      maxPadding: 0,
      startOnTick: false,
      endOnTick: false,
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      formatter: function (this: Highcharts.Point): string {
        const dateLabel = labels[this.index]
        return `<b>${dateLabel}</b><br/>● : ${this.y}건`
      },
    },
    plotOptions: {
      spline: {
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 5,
          },
        },
        marker: {
          enabled: false,
        },
        pointInterval: 3600000,
        pointStart: Date.UTC(2024, 1, 29),
      },
    },
    series: [
      {
        type: 'spline',
        name: '',
        data,
        color: '#1a73e8',
      },
    ],
  })

  return (
    <div css={container}>
      <div css={violationsContainer}>
        <div css={violationItem}>
          {violationData != null && (
            <>
              <div css={violationHeader}>
                <span css={violationTitle}>안전모 미착용</span>
                <div css={trendContainer}></div>
              </div>
              <div css={violationContent}>
                <span css={violationCount}>
                  {violationData.helmet[6].toString()}건
                </span>
                <div css={chartWrapper}>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={chart(violationData.helmet, violationData.label)}
                    containerProps={{
                      style: { width: '100%', height: '100%' },
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div css={violationItem}>
          {violationData != null && (
            <>
              <div css={violationHeader}>
                <span css={violationTitle}>안전 조끼 미착용</span>
                <div css={trendContainer}></div>
              </div>
              <div css={violationContent}>
                <span css={violationCount}>
                  {violationData.belt[6].toString()}건
                </span>
                <div css={chartWrapper}>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={chart(violationData.belt, violationData.label)}
                    containerProps={{
                      style: { width: '100%', height: '100%' },
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Violation

const container = css`
  width: 100%;
  height: 220px;
  display: flex;
  flex-direction: column;
`

const violationsContainer = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const violationItem = css`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const violationHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const violationTitle = css`
  font-size: 16px;
  font-weight: 600;
`

const trendContainer = css`
  display: flex;
  align-items: center;
  gap: 4px;
`

const violationContent = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`

const violationCount = css`
  font-weight: 1000;
  font-size: 2rem;
`

const chartWrapper = css`
  flex: 1;
  height: 100px;
  z-index: 99;
`
