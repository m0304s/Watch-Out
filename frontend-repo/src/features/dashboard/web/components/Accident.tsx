import { css } from '@emotion/react'
import Highcharts from 'highcharts'
import { useEffect, useState, useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import type { AreaListItem, AreaListResponse } from '@/features/area/types/area'
import { dashboardAPI } from '@/features/dashboard/services/dashboard'

interface AccidentProps {
  area: AreaListItem | 'all'
  areaList: AreaListResponse | null
}

interface ChartData {
  current: number[]
  previous: number[]
  labels: string[]
}

interface StatData {
  todayCurrent: number
  last7Days: number
}

const Accident: React.FC<AccidentProps> = ({ area, areaList }) => {
  const [statData, setStatData] = useState<StatData | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)

    const fetchAccidentData = async () => {
      try {
        let areaUuids: string[] = []
        if (areaList && area === 'all') {
          areaUuids = areaList.data.map((area) => area.areaUuid)
        } else if (area !== 'all') {
          areaUuids = [area.areaUuid]
        }
        const response = await dashboardAPI.postAccidentStatus({
          areaUuids: areaUuids,
        })
        if (response) {
          setStatData({
            todayCurrent: response.todayCurrent,
            last7Days: response.last7Days,
          })
          setChartData({
            current: response.hourlyTrends.map((item) => item.current),
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
  }, [area])

  const chartOptions: Highcharts.Options = useMemo(() => {
    if (!chartData) {
      return {}
    }

    return {
      chart: {
        type: 'spline',
        backgroundColor: '#F8F8F8',
      },
      title: {
        text: '',
        align: 'left',
      },
      xAxis: {
        categories: chartData.labels,
        title: {
          text: '',
        },
      },
      yAxis: {
        title: {
          text: '',
        },
      },
      legend: {
        symbolWidth: 30,
        verticalAlign: 'bottom',
        align: 'left',
      },
      tooltip: {
        valueSuffix: '건',
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
    <>
      {statData && chartData && (
        <>
          <div css={container}>
            <div css={header}>
              <h3 css={title}>사고 발생 현황</h3>
            </div>
            <div css={statsContainer}>
              <div css={currentStatItem}>
                <span css={currentStatLabel}>오늘 현재</span>
                <span css={currentStatCaseData}>{statData.todayCurrent}</span>
              </div>
              <div css={previousStatItem}>
                <span css={previousStatLabel}>지난 7일</span>
                <span css={previousStatCaseData}>{statData.last7Days}</span>
              </div>
            </div>
            <div css={chartContainer}>
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Accident

const container = css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: '#F8F8F8';
`

const header = css`
  margin-bottom: 16px;
`

const title = css`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`

const statsContainer = css`
  display: flex;
  gap: 16px;
`

const statItemBase = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  gap: 4px;
`

const statLabelBase = css`
  font-size: 18px;
`

const statCaseDataBase = css`
  font-family: 'PretendardBold';
  font-size: 2rem;
`

const currentStatItem = css`
  ${statItemBase};
  background-color: var(--color-primary-medium);
  color: var(--color-primary);
  border-top: 5px solid var(--color-primary);
`

const previousStatItem = statItemBase

const currentStatLabel = css`
  ${statLabelBase};
  font-weight: 700;
`

const previousStatLabel = css`
  ${statLabelBase};
  color: var(--color-gray-700);
`

const currentStatCaseData = css`
  ${statCaseDataBase};
  color: var(--color-text-black);
`

const previousStatCaseData = css`
  ${statCaseDataBase};
  color: var(--color-gray-700);
`

const chartContainer = css`
  flex: 1;
  min-height: 300px;
`
