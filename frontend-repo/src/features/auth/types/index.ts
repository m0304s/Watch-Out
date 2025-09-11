export interface LoginRequest {
  id: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  userUuid: string
  userId: string
  userName: string
  userRole: 'WORKER' | 'AREA_ADMIN' | 'ADMIN'
  isApproved: boolean
}

export interface LoginFormData {
  id: string
  password: string
}

export interface AuthError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Signup types
export type ABOType = 'A' | 'B' | 'AB' | 'O'
export type RhFactor = '+' | '-'
export type FullBloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface SignUpFormData {
  userId: string
  password: string
  userName: string
  contact: string
  emergencyContact: string
  fullBloodType: FullBloodType
  photoUrl?: string
  companyUuid: string
}

export interface SignUpRequest {
  userId: string
  password: string
  userName: string
  contact: string
  emergencyContact: string
  bloodType: ABOType
  rhFactor: RhFactor
  photoUrl?: string
  companyUuid: string
}

export interface CompanyOption {
  companyUuid: string
  companyName: string
}