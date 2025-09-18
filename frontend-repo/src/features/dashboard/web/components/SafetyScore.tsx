import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import 'highcharts/highcharts-more'
import { useEffect, useState } from 'react'
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
      height: '80%',
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
          fontSize: '14px',
        },
      },
      lineWidth: 0,
      plotBands: [
        {
          from: 0,
          to: 60,
          color: '#55BF3B',
          thickness: 20,
          borderRadius: '50%',
        },
        {
          from: 60,
          to: 80,
          color: '#DDDF0D',
          thickness: 20,
          borderRadius: '50%',
        },
        {
          from: 80,
          to: 100,
          color: '#DF5353',
          thickness: 20,
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
    <div>
      {score >= 0 && (
        <>
          <HighchartsReact highcharts={Highcharts} options={chartOption} />
          {score} 점
        </>
      )}
    </div>
  )
}

export default SafetyScore
