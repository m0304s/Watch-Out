import { css } from '@emotion/react'
import { useEffect, useState, useMemo } from 'react'
import type { AreaListItem } from '@/features/area/types/area'
import { dashboardAPI } from '@/features/dashboard/services/dashboard'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

interface AccidentProps {
  area: AreaListItem
}

interface ChartData {
  current: number[]
  previous: number[]
  labels: string[]
}

const Accident: React.FC<AccidentProps> = ({ area }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)

    const fetchAccidentData = async () => {
      try {
        const response = await dashboardAPI.postAccidentStatus({
          areaUuids: [area.areaUuid],
        })
        if (response) {
          setChartData({
            current: response.hourlyTrends.map((item) => item.currnet),
            previous: response.hourlyTrends.map((item) => item.previous),
            labels: response.hourlyTrends.map((item) => item.timeLabel),
          })
        }
      } catch (error) {
        console.log('사고 발생 현황 오류', error)
        setChartData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccidentData()
  }, [area.areaUuid])

  const chartOptions: Highcharts.Options = useMemo(() => {
    if (!chartData) {
      return {}
    }

    return {
      chart: {
        type: 'spline',
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
        align: 'left',
      },
      xAxis: {
        categories: chartData.labels,
        title: {
          text: '시간',
        },
      },
      yAxis: {
        title: {
          text: '사고 건수',
        },
      },
      legend: {
        symbolWidth: 30,
        verticalAlign: 'top',
        align: 'right',
      },
      tooltip: {
        valueSuffix: ' 건',
        stickOnContact: true,
        shared: true,
        crosshairs: true,
      },
      plotOptions: {
        spline: {
          lineWidth: 3,
          marker: {
            enabled: false,
          },
        },
      },
      series: [
        {
          type: 'spline',
          name: '지난 7일',
          data: chartData.current,
          color: '#1a73e8',
        },
        {
          type: 'spline',
          name: '이전 기간',
          data: chartData.previous,
          color: '#1a73e8',
          dashStyle: 'ShortDash',
        },
      ],
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: { maxWidth: 500 },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
              },
            },
          },
        ],
      },
    }
  }, [chartData])

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (!chartData) {
    return <div>데이터를 불러오는 데 실패했습니다.</div>
  }

  return (
    <div css={container}>
      <div css={header}>
        <h3 css={title}>사고 발생 현황</h3>
      </div>
      <div css={statsContainer}>
        <div css={statItem}>
          <span css={statLabel}>오늘 현재</span>
        </div>
        <div css={statItem}>
          <span css={statLabel}>지난 7일</span>
        </div>
      </div>
      <div css={chartContainer}>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </div>
  )
}

export default Accident

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
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
`

const statsContainer = css`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`

const statItem = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const statLabel = css`
  font-size: 14px;
  color: #6b7280;
`

const chartContainer = css`
  flex: 1;
  min-height: 300px;
`
