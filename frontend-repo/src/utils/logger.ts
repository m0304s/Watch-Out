// 로그 레벨 정의
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 로그 엔트리 타입
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: any
  component?: string
  action?: string
}

// 로거 클래스
class Logger {
  private isDevelopment = import.meta.env.DEV
  private logLevel: LogLevel = this.isDevelopment
    ? LogLevel.DEBUG
    : LogLevel.INFO

  private log(
    level: LogLevel,
    message: string,
    context?: any,
    component?: string,
    action?: string,
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      component,
      action,
    }

    // 개발 환경에서만 콘솔에 출력
    if (this.isDevelopment) {
      const emoji = this.getEmoji(level)
      const timestamp = entry.timestamp.toISOString()
      const prefix = `[${timestamp}] ${emoji}`

      console.log(`${prefix} ${message}`, context || '')

      if (component) {
        console.log(`  📦 Component: ${component}`)
      }
      if (action) {
        console.log(`  🎯 Action: ${action}`)
      }
    }

    // 프로덕션에서는 에러만 로깅
    if (level === LogLevel.ERROR) {
      this.logError(entry)
    }
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🐛'
      case LogLevel.INFO:
        return 'ℹ️'
      case LogLevel.WARN:
        return '⚠️'
      case LogLevel.ERROR:
        return '❌'
      default:
        return '📝'
    }
  }

  private logError(entry: LogEntry) {
    // 에러 로깅 서비스에 전송 (예: Sentry, LogRocket 등)
    // 현재는 콘솔에만 출력
    console.error('🚨 Error logged:', entry)
  }

  // 공개 메서드들
  debug(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.DEBUG, message, context, component, action)
  }

  info(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.INFO, message, context, component, action)
  }

  warn(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.WARN, message, context, component, action)
  }

  error(message: string, context?: any, component?: string, action?: string) {
    this.log(LogLevel.ERROR, message, context, component, action)
  }

  // API 관련 로깅
  apiRequest(method: string, url: string, data?: any) {
    this.debug(`API Request: ${method} ${url}`, data, 'API', 'request')
  }

  apiResponse(method: string, url: string, status: number, data?: any) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this.log(
      level,
      `API Response: ${method} ${url} (${status})`,
      data,
      'API',
      'response',
    )
  }

  apiError(method: string, url: string, error: any) {
    this.error(`API Error: ${method} ${url}`, error, 'API', 'error')
  }

  // 컴포넌트 관련 로깅
  componentMount(componentName: string, props?: any) {
    this.debug(
      `Component mounted: ${componentName}`,
      props,
      componentName,
      'mount',
    )
  }

  componentUnmount(componentName: string) {
    this.debug(
      `Component unmounted: ${componentName}`,
      undefined,
      componentName,
      'unmount',
    )
  }

  componentError(componentName: string, error: any, action?: string) {
    this.error(
      `Component error in ${componentName}`,
      error,
      componentName,
      action,
    )
  }

  // 스토어 관련 로깅
  storeAction(storeName: string, action: string, payload?: any) {
    this.debug(
      `Store action: ${storeName}.${action}`,
      payload,
      storeName,
      action,
    )
  }

  storeError(storeName: string, action: string, error: any) {
    this.error(
      `Store error in ${storeName}.${action}`,
      error,
      storeName,
      action,
    )
  }

  // 사용자 액션 로깅
  userAction(action: string, context?: any) {
    this.info(`User action: ${action}`, context, 'User', action)
  }

  // 성능 로깅
  performance(operation: string, duration: number, context?: any) {
    this.info(
      `Performance: ${operation} took ${duration}ms`,
      context,
      'Performance',
      operation,
    )
  }
}

// 싱글톤 인스턴스
export const logger = new Logger()

// 편의 함수들
export const logDebug = (
  message: string,
  context?: any,
  component?: string,
  action?: string,
) => {
  logger.debug(message, context, component, action)
}

export const logInfo = (
  message: string,
  context?: any,
  component?: string,
  action?: string,
) => {
  logger.info(message, context, component, action)
}

export const logWarn = (
  message: string,
  context?: any,
  component?: string,
  action?: string,
) => {
  logger.warn(message, context, component, action)
}

export const logError = (
  message: string,
  context?: any,
  component?: string,
  action?: string,
) => {
  logger.error(message, context, component, action)
}

// 성능 측정 헬퍼
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T>,
  context?: any,
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    logger.performance(operation, duration, context)
    return result
  } catch (error) {
    const duration = performance.now() - start
    logger.error(
      `Performance error in ${operation}`,
      { error, duration },
      'Performance',
      operation,
    )
    throw error
  }
}
