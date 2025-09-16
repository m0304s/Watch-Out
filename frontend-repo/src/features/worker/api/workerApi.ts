import { api } from '@/apis/axios'
import type {
  Employee,
  PaginatedResponse,
  GetEmployeesParams,
  AreaOption,
} from '@/features/worker/types'

// Worker API 엔드포인트 상수 관리
const WORKER_ENDPOINTS = {
  USERS: '/user',
  AREAS: '/area',
} as const

// 작업자 목록 조회 API
export const getEmployees = async (params: GetEmployeesParams = {}): Promise<PaginatedResponse<Employee>> => {
  const {
    areaUuid = '',
    trainingStatus,
    search = '',
    pageNum = 1,
    display = 10,
  } = params

  const queryParams = {
    areaUuid,
    trainingStatus: trainingStatus || '',
    search,
    pageNum,
    display,
  }

  const response = await api.get<PaginatedResponse<Employee>>(WORKER_ENDPOINTS.USERS, {
    params: queryParams,
  })

  return response.data
}

// 구역 목록 조회 API (초기 진입 시 호출)
export const getAreas = async (): Promise<AreaOption[]> => {
  const response = await api.get<{ data: AreaOption[] }>(WORKER_ENDPOINTS.AREAS)
  return response.data?.data ?? []
}

// Worker API 객체로 내보내기
export const workerApi = {
  getEmployees,
  getAreas,
}

export default workerApi
