import { api } from '@/api/client'
import type {
  Employee,
  PaginatedResponse,
  GetEmployeesParams,
  AreaOption,
  WorkerDetail,
  UpdateUserRoleRequest,
} from '@/features/worker/types'

// Worker API 엔드포인트 상수 관리
const WORKER_ENDPOINTS = {
  USERS: '/user',
  AREAS: '/area',
  USER_ROLE: '/user/role',
} as const

// 작업자 목록 조회 API
export const getEmployees = async (
  params: GetEmployeesParams = {},
): Promise<PaginatedResponse<Employee>> => {
  const {
    areaUuid = '',
    trainingStatus,
    search = '',
    userRole,
    pageNum = 1,
    display = 10,
  } = params

  const queryParams = {
    areaUuid,
    trainingStatus: trainingStatus || '',
    search,
    userRole: userRole || '',
    pageNum,
    display,
  }

  const response = await api.get<PaginatedResponse<Employee>>(
    WORKER_ENDPOINTS.USERS,
    {
      params: queryParams,
    },
  )

  return response.data
}

// 구역 목록 조회 API (초기 진입 시 호출)
export const getAreas = async (): Promise<AreaOption[]> => {
  const response = await api.get<{ data: AreaOption[] }>(WORKER_ENDPOINTS.AREAS)
  return response.data?.data ?? []
}

// 작업자 상세 정보 조회 API
export const getWorkerDetail = async (
  userUuid: string,
): Promise<WorkerDetail> => {
  const response = await api.get<WorkerDetail>(
    `${WORKER_ENDPOINTS.USERS}/${userUuid}`,
  )
  return response.data
}

// 사용자 역할 변경 API
export const updateUserRole = async (
  request: UpdateUserRoleRequest,
): Promise<void> => {
  await api.patch(WORKER_ENDPOINTS.USER_ROLE, request)
}

// Worker API 객체로 내보내기
export const workerApi = {
  getEmployees,
  getAreas,
  getWorkerDetail,
  updateUserRole,
}

export default workerApi
