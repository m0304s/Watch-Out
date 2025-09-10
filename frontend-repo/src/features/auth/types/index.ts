export interface LoginRequest {
  id: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  userUuid: string
  userId: string
  userName: string
  userRole: 'WORKER' | 'MANAGER' | 'ADMIN'
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
