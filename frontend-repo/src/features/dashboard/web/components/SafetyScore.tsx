import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import 'highcharts/highcharts-more'
import { dashboardAPI } from '@/features/dashboard/services/dashboard'
import type { AreaListItem } from '@/features/area/types/area'

interface SafetyScoreProps {
  area: AreaListItem
}

const SafetyScore: React.FC<SafetyScoreProps> = ({ area }) => {
  const [score, setScore] = useState<number>(0)

  useEffect(() => {
    const fetchSafetyScore = async () => {
      try {
        const response = await dashboardAPI.getSafetyScore({
          areaUuids: [area.areaUuid],
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
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
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
      tickColor: 'var(--highcharts-background-color, #FFFFFF)',
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
          color: '#DF5353',
          thickness: 15,
          borderRadius: '50%',
        },
        {
          from: 60,
          to: 80,
          color: '#DDDF0D',
          thickness: 15,
          borderRadius: '50%',
        },
        {
          from: 80,
          to: 100,
          color: '#55BF3B',
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
            (Highcharts.defaultOptions.title &&
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color) ||
            '#333333',
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
      <div css={header}>
        <h3 css={title}>오늘의 안전 지수</h3>
      </div>
      {score >= 0 && (
        <>
          <div css={chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={chartOption} />
          </div>
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

const header = css`
  margin-bottom: 16px;
`

const title = css`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
`

const timestamp = css`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
`

const chartContainer = css`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const scoreContainer = css`
  text-align: center;
  margin-top: 8px;
`

const scoreText = css`
  font-size: 24px;
  font-weight: 700;
  color: #374151;
`
