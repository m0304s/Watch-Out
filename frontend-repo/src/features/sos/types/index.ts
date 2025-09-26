export interface AccidentRequest {
  accidentType: 'MANUAL_SOS'
}

export interface AccidentResponse {
  accidentId: string
  accidentType: string
  timestamp: string
  areaInfo: {
    areaUuid: string
    areaName: string
  }
  workerInfo: {
    workerId: string
    workerName: string
    companyName: string
  }
}
