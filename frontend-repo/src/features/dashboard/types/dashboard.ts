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
  description: '안전모 미착용' | '안전밸트 미착용'
  count: number
}

export interface ViolationStatusResponse {
  violationTypes: ViolationStatusItem[]
}

export interface AccidentStatusRequest {
  areaUuids: string[]
}

export interface AccidentStatusItem {
  timeLabel: string
  currnet: number
  previous: number
}

export interface AccidentStatusResponse {
  todayCurrent: number
  last7Days: number
  hourlyTrends: AccidentStatusItem[]
}
