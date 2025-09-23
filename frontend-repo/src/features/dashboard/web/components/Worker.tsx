import { css } from '@emotion/react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useEffect, useMemo, useState } from 'react'
import type { AreaListItem, AreaListResponse } from '@/features/area/types/area'
import { dashboardAPI } from '@/features/dashboard/services/dashboard'
import type { WorkerCountResponse } from '@/features/dashboard/types/dashboard'
import { useToast } from '@/hooks/useToast'

interface WorkerProps {
  area: AreaListItem | 'all'
  areaList: AreaListResponse | null
}

const Worker = ({ area, areaList }: WorkerProps) => {
  const { error } = useToast()
  const [chartData, setChartData] = useState<WorkerCountResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)
    const fetchWorkerCount = async () => {
      try {
        let areaUuids: string[] = []
        if (areaList && area === 'all') {
          areaUuids = areaList.data.map((area) => area.areaUuid)
        } else if (area !== 'all') {
          areaUuids = [area.areaUuid]
        }
        const response = await dashboardAPI.postWorkerCount({
          areaUuids: areaUuids,
        })

        if (response) {
          setChartData({
            nowWorkers: response.nowWorkers,
            allWorkers: response.allWorkers,
          })
        }
      } catch (err) {
        error('작업 인원을 불러오는 데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkerCount()
  }, [area, areaList, error])

  const chartOptions: Highcharts.Options = useMemo(() => {
    if (!chartData) {
      return {}
    }

    return {
      chart: {
        type: 'pie',
        backgroundColor: '#F8F8F8',
        width: 250,
        height: 250,
      },
      accessibility: {
        point: {
          valueSuffix: '',
        },
      },
      title: {
        text: `${chartData.nowWorkers}명`,
        align: 'center',
        verticalAlign: 'middle',
        style: {
          fontSize: '2rem',
          fontWeight: 'bold',
        },
      },
      tooltip: {
        pointFormat: '{point.y}명',
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderRadius: 0,
          dataLabels: [
            {
              enabled: false,
              distance: 20,
              format: '{point.name}',
              textOutline: 'none',
            },
          ],
          showInLegend: true,
        },
      },
      series: [
        {
          type: 'pie',
          name: 'Registrations',
          innerSize: '75%',
          data: [
            {
              name: '출근 인원',
              y: chartData.nowWorkers,
              color: '#1A73E8',
            },
            {
              name: '결원',
              y: chartData.allWorkers - chartData.nowWorkers,
              color: '#a0a0a0',
            },
          ],
        },
      ],
      credits: {
        enabled: false,
      },
    }
  }, [chartData])
  console.log('차트데이터', chartData)
  return (
    <>
      {isLoading ? (
        <div>로딩중입니다.</div>
      ) : (
        <div css={container}>
          <h3 css={title}>작업 인원</h3>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      )}
    </>
  )
}

export default Worker

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
