import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import 'highcharts/highcharts-more'
import { dashboardAPI } from '@/features/dashboard/services/dashboard'
import type { AreaListItem, AreaListResponse } from '@/features/area/types/area'

interface SafetyScoreProps {
  area: AreaListItem | 'all'
  areaList: AreaListResponse | null
}

const SafetyScore: React.FC<SafetyScoreProps> = ({ area, areaList }) => {
  const [score, setScore] = useState<number>(0)

  useEffect(() => {
    const fetchSafetyScore = async () => {
      try {
        let areaUuids: string[] = []
        if (areaList && area === 'all') {
          areaUuids = areaList.data.map((area) => area.areaUuid)
        } else if (area !== 'all') {
          areaUuids = [area.areaUuid]
        }
        const response = await dashboardAPI.getSafetyScore({
          areaUuids: areaUuids,
        })
        const safetyScore = response
        if (safetyScore) {
          setScore(safetyScore.todayScore)
        }
      } catch (error) {
        console.log('안전 지수 오류', error)
      }
    }
    fetchSafetyScore()
  }, [area])

  const chartOption = {
    chart: {
      type: 'gauge',
      backgroundColor: '#F8F8F8',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
      height: 200,
      height: 200,
    },

    title: {
      text: '',
    },

    pane: {
      startAngle: -90,
      endAngle: 89.9,
      background: null,
      center: ['50%', '75%'],
      size: '110%',
    },

    yAxis: {
      min: 0,
      max: 100,
      tickInterval: 15,
      tickPixelInterval: 72,
      tickPosition: 'inside',
      tickColor: '#F8F8F8',
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: null,
      labels: {
        distance: 20,
        style: {
          fontSize: '12px',
        },
      },
      lineWidth: 0,
      plotBands: [
        {
          from: 0,
          to: 60,
          color: '#ff1818',
          thickness: 15,
          borderRadius: '50%',
        },
        {
          from: 60,
          to: 80,
          color: '#f1c40f',
          thickness: 15,
          borderRadius: '50%',
        },
        {
          from: 80,
          to: 100,
          color: '#57ad5a',
          thickness: 15,
          borderRadius: '50%',
        },
      ],
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        data: [score], // 값
        tooltip: {
          valueSuffix: '점',
        },
        dataLabels: {
          format: '',
          borderWidth: 0,
          color:
            Highcharts.defaultOptions.title &&
            Highcharts.defaultOptions.title.style &&
            Highcharts.defaultOptions.title.style.color,
          style: {
            fontSize: '16px',
          },
        },
        dial: {
          radius: '80%',
          backgroundColor: 'gray',
          baseWidth: 12,
          baseLength: '0%',
          rearLength: '0%',
        },
        pivot: {
          backgroundColor: 'gray',
          radius: 6,
        },
      },
    ],
  }

  return (
    <div css={container}>
      <h3 css={title}>오늘의 안전 지수</h3>
      {score >= 0 && (
        <>
          <HighchartsReact highcharts={Highcharts} options={chartOption} />
          <div css={scoreContainer}>
            <span css={scoreText}>{score}점</span>
          </div>
        </>
      )}
    </div>
  )
}

export default SafetyScore

const container = css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const title = css`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
`

const scoreContainer = css`
  text-align: center;
`

const scoreText = css`
  font-weight: 1000;
  font-size: 2rem;
`
