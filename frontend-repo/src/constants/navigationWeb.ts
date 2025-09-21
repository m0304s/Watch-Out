import type { ComponentType } from 'react'
import { TiHome } from 'react-icons/ti'
import { IoMdCrop } from 'react-icons/io'
import { MdPeopleAlt } from 'react-icons/md'
import { GiPieChart } from 'react-icons/gi'
import { TbDeviceWatchCog } from 'react-icons/tb'

export interface NavItem {
  id: number
  name: string
  icon?: ComponentType
  path: string
  children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 1,
    name: '대시보드',
    path: '/dashboard',
    icon: TiHome,
  },
  {
    id: 2,
    name: '현장 관리',
    path: '',
    icon: IoMdCrop,
    children: [
      {
        id: 201,
        name: 'CCTV',
        path: '/cctv/monitoring',
      },
      {
        id: 202,
        name: 'CCTV 설정',
        path: '/cctv/settings',
      },
      {
        id: 203,
        name: '구역 관리',
        path: '/area',
      },
    ],
  },
  {
    id: 3,
    name: '작업자 관리',
    path: '/worker1',
    icon: MdPeopleAlt,
  },
  {
    id: 4,
    name: '통계 및 분석',
    path: '/statistics',
    icon: GiPieChart,
  },
  {
    id: 5,
    name: '워치 관리',
    path: '/watch',
    icon: TbDeviceWatchCog,
  },
]
