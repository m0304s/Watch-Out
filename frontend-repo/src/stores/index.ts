// 공통 스토어
export * from './common'

// 인증 스토어
export * from './authStore'

// 레이아웃 스토어
export * from './layoutStore'

// 날씨 스토어
export * from './weatherStore'

// 스토어 초기화 함수들
export const initializeStores = () => {
  // 날씨 스토어 초기화
  const { initializeWeatherStore } = require('./weatherStore')
  initializeWeatherStore()

  console.log('✅ 모든 스토어가 초기화되었습니다.')
}

// 스토어 리셋 함수
export const resetAllStores = () => {
  const { reset: resetCommon } = require('./common')
  const { clearAuth } = require('./authStore')
  const { reset: resetLayout } = require('./layoutStore')
  const { clearCache } = require('./weatherStore')

  resetCommon()
  clearAuth()
  resetLayout()
  clearCache()

  console.log('✅ 모든 스토어가 리셋되었습니다.')
}
