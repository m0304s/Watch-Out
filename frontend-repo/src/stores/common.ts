import { create } from 'zustand'
import type { LoadingState, StoreActions } from '@/types/common'

// 공통 로딩 상태 관리
interface CommonState extends LoadingState {
  // 추가 공통 상태들
  isInitialized: boolean
  lastUpdated: number | null
}

interface CommonActions extends StoreActions {
  setInitialized: (initialized: boolean) => void
  setLastUpdated: (timestamp: number) => void
  reset: () => void
}

type CommonStore = CommonState & CommonActions

const initialState: CommonState = {
  loading: false,
  error: null,
  isInitialized: false,
  lastUpdated: null,
}

export const useCommonStore = create<CommonStore>((set) => ({
  ...initialState,

  setLoading: (loading: boolean) => {
    set({ loading })
  },

  setError: (error: string | null) => {
    set({ error, loading: false })
  },

  clearError: () => {
    set({ error: null })
  },

  setInitialized: (initialized: boolean) => {
    set({ isInitialized: initialized })
  },

  setLastUpdated: (timestamp: number) => {
    set({ lastUpdated: timestamp })
  },

  reset: () => {
    set(initialState)
  },
}))

// 공통 스토어 훅들
export const useLoading = () => {
  const loading = useCommonStore((state) => state.loading)
  const setLoading = useCommonStore((state) => state.setLoading)
  return { loading, setLoading }
}

export const useError = () => {
  const error = useCommonStore((state) => state.error)
  const setError = useCommonStore((state) => state.setError)
  const clearError = useCommonStore((state) => state.clearError)
  return { error, setError, clearError }
}

export const useCommonActions = () => {
  const setLoading = useCommonStore((state) => state.setLoading)
  const setError = useCommonStore((state) => state.setError)
  const clearError = useCommonStore((state) => state.clearError)
  const setInitialized = useCommonStore((state) => state.setInitialized)
  const setLastUpdated = useCommonStore((state) => state.setLastUpdated)
  const reset = useCommonStore((state) => state.reset)

  return {
    setLoading,
    setError,
    clearError,
    setInitialized,
    setLastUpdated,
    reset,
  }
}
