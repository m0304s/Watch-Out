import { css } from '@emotion/react'
import React, { useEffect, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { dashboardAPI } from '@/features/dashboard/services/dashboard'
import type { AreaListItem } from '@/features/area/types/area'

interface ViolationProps {
  area: AreaListItem
}

const Violation: React.FC<ViolationProps> = ({ area }) => {
  const [helmetVioltaionData, setHelmetVioltaionData] = useState<number | null>(
    null,
  )
  const [beltVioltaionData, setBeltVioltaionData] = useState<number | null>(
    null,
  )

  useEffect(() => {
    const fetchViolation = async () => {
      try {
        const response = await dashboardAPI.postViolationStatus({
          areaUuids: [area.areaUuid],
        })

        if (response) {
          const helmetData = response.violationTypes.find(
            (item) => item.violationType === 'HELMET_OFF',
          )
          const beltData = response.violationTypes.find(
            (item) => item.violationType === 'BELT_OFF',
          )
          setHelmetVioltaionData(helmetData ? helmetData.count : 0)
          setBeltVioltaionData(beltData ? beltData.count : 0)
        }
      } catch (error) {
        console.log('안전장비 미착용 오류')
      }
    }
    fetchViolation()
  }, [])

  const chart = (data: number[]) => ({
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
    },
    title: {
      text: '',
    },
    subtitle: {
      text: '',
    },
    xAxis: {
      visible: false,
    },
    yAxis: {
      visible: false,
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      valueSuffix: '건',
    },
    plotOptions: {
      spline: {
        lineWidth: 4,
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
      },
    ],
  })

  return (
    <div css={container}>
      <div css={header}>
        <h3 css={title}>안전장비 미착용</h3>
      </div>
      <div css={violationsContainer}>
        <div css={violationItem}>
          {helmetVioltaionData != null && (
            <>
              <div css={violationHeader}>
                <span css={violationTitle}>안전모 미착용</span>
                <div css={trendContainer}></div>
              </div>
              <div css={violationContent}>
                <span css={violationCount}>{helmetVioltaionData}건</span>
                <div css={chartWrapper}>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={chart([helmetVioltaionData])}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div css={violationItem}>
          {beltVioltaionData != null && (
            <>
              <div css={violationHeader}>
                <span css={violationTitle}>안전 조끼 미착용</span>
                <div css={trendContainer}></div>
              </div>
              <div css={violationContent}>
                <span css={violationCount}>{beltVioltaionData}건</span>
                <div css={chartWrapper}>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={chart([beltVioltaionData])}
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
  height: 100%;
  display: flex;
  flex-direction: column;
`

const header = css`
  margin-bottom: 16px;
`

const title = css`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
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
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`

const trendContainer = css`
  display: flex;
  align-items: center;
  gap: 4px;
`

const violationContent = css`
  display: flex;
  align-items: center;
  gap: 12px;
`

const violationCount = css`
  font-size: 20px;
  font-weight: 700;
  color: #374151;
`

const chartWrapper = css`
  flex: 1;
  height: 40px;
`
