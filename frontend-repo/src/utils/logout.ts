/**
 * 로그아웃 관련 유틸리티 함수들
 */

/**
 * 로컬스토리지에서 모든 인증 관련 데이터를 완전히 제거합니다.
 * 이중 안전장치로 localStorage.clear()와 개별 키 제거를 모두 수행합니다.
 */
export const clearAllAuthData = (): void => {
  try {
    // 모든 로컬스토리지 데이터 제거
    localStorage.clear()

    // 추가적으로 인증 관련 키들도 명시적으로 제거 (이중 안전장치)
    const authKeys = [
      'accessToken',
      'auth-storage',
      'refreshToken',
      'user',
      'token',
      'auth',
      'session',
      'login',
    ]

    authKeys.forEach((key) => {
      localStorage.removeItem(key)
    })

    console.log('✅ 로컬스토리지 완전 클리어 완료')
  } catch (error) {
    console.error('❌ 로컬스토리지 클리어 중 오류:', error)
  }
}

/**
 * 로그아웃 후 로그인 페이지로 리다이렉트합니다.
 */
export const redirectToLogin = (): void => {
  try {
    // 현재 페이지를 로그인 페이지로 교체
    window.location.href = '/login'
  } catch (error) {
    console.error('❌ 로그인 페이지 리다이렉트 중 오류:', error)
    // 폴백: 페이지 새로고침
    window.location.reload()
  }
}

/**
 * 로그아웃 상태를 확인합니다.
 * 로컬스토리지에 인증 토큰이 있는지 확인합니다.
 */
export const isLoggedOut = (): boolean => {
  try {
    const token = localStorage.getItem('accessToken')
    const authStorage = localStorage.getItem('auth-storage')

    return !token && !authStorage
  } catch (error) {
    console.error('❌ 로그아웃 상태 확인 중 오류:', error)
    return true // 오류 발생 시 로그아웃된 것으로 간주
  }
}

/**
 * 강제 로그아웃을 수행합니다.
 * API 호출 없이 로컬 데이터만 정리하고 로그인 페이지로 이동합니다.
 */
export const forceLogout = (): void => {
  console.log('🚪 강제 로그아웃 시작')

  // 1. 로컬스토리지 완전 클리어
  clearAllAuthData()

  // 2. 로그인 페이지로 리다이렉트
  redirectToLogin()
}
