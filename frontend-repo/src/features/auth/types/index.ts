export interface LoginRequest {
  userId: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  userUuid: string
  userId: string
  userName: string
  userRole: 'WORKER' | 'AREA_ADMIN' | 'ADMIN'
  areaUuid?: string
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
export type RhFactor = 'PLUS' | 'MINUS'
export type FullBloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
export type Gender = 'MALE' | 'FEMALE'

export interface SignUpFormData {
  userId: string
  password: string
  userName: string
  contact: string
  emergencyContact: string
  fullBloodType: FullBloodType
  photoUrl?: string
  companyUuid: string
  gender: Gender
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
  gender: Gender
}

export interface CompanyOption {
  companyUuid: string
  companyName: string
}

// API Response 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean
  result?: T
  message?: string
  code?: string
}

// 토큰 재발급 응답 타입
export interface RefreshTokenResponse {
  accessToken: string
}

// S3 관련 타입 정의
export interface PresignedUrlRequest {
  fileName: string
}

export interface PresignedUrlResponse {
  uploadUrl: string
  fileUrl: string
}

// 얼굴 사진 등록 관련 타입 정의
export interface FacePresignedUrlRequest {
  fileNames: string[]
}

export interface FacePresignedUrlResponse {
  uploadUrl: string
  fileUrl: string
}

export interface FacePhotos {
  front?: File
  left?: File
  right?: File
}

export interface CapturedPhotos {
  front?: string
  left?: string
  right?: string
}

export type FacePhotoType = 'front' | 'left' | 'right'

export interface FaceRegistrationError {
  code: 'UPLOAD_FAILED' | 'INVALID_FILE' | 'NETWORK_ERROR' | 'SERVER_ERROR'
  message: string
  details?: Record<string, unknown>
}
