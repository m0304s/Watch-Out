import { useEffect, useRef, useState } from 'react'
import { logger } from '@/utils/logger'

// 디바운스 훅
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 이전 값 추적 훅
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

// 로컬 스토리지 훅
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      logger.error('로컬 스토리지 읽기 실패', error, 'useLocalStorage', 'read')
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      logger.error('로컬 스토리지 저장 실패', error, 'useLocalStorage', 'write')
    }
  }

  return [storedValue, setValue]
}

// 세션 스토리지 훅
export const useSessionStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      logger.error(
        '세션 스토리지 읽기 실패',
        error,
        'useSessionStorage',
        'read',
      )
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      logger.error(
        '세션 스토리지 저장 실패',
        error,
        'useSessionStorage',
        'write',
      )
    }
  }

  return [storedValue, setValue]
}

// 비동기 작업 훅
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      logger.info('비동기 작업 성공', { result }, 'useAsync', 'success')
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      logger.error('비동기 작업 실패', error, 'useAsync', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    execute()
  }, dependencies)

  return { data, loading, error, execute }
}

// 인터섹션 옵저버 훅
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {},
) => {
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback()
        }
      })
    }, options)

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [callback, options])

  return targetRef
}

// 윈도우 크기 훅
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// 온라인 상태 훅
export const useOnline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
