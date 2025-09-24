export interface SafetyScoreRequest {
  areaUuids: string[]
}

export interface SafetyScoreResponse {
  todayScore: number
}

export interface ViolationStatusRequest {
  areaUuids: string[]
}

export interface ViolationStatusItem {
  violationType: 'HELMET_OFF' | 'BELT_OFF'
  description: '안전모 미착용' | '안전벨트 미착용'
  count: number
}

export interface DailyViolation {
  date: string
  items: ViolationStatusItem[]
}

export interface ViolationStatusResponse {
  days: DailyViolation[]
}

export interface AccidentStatusRequest {
  areaUuids: string[]
}

export interface AccidentStatusItem {
  timeLabel: string
  current: number
  previous: number
}

export interface AccidentStatusResponse {
  todayCurrent: number
  last7Days: number
  hourlyTrends: AccidentStatusItem[]
}

export interface WorkerCountRequest {
  areaUuids: string[]
}

export interface WorkerCountResponse {
  nowWorkers: number
  allWorkers: number
}
