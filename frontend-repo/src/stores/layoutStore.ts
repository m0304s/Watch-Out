import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  // 네비게이션 상태
  isNavOpen: boolean

  // 모바일 관련 상태
  isMobileMenuOpen: boolean

  // 사이드바 상태
  sidebarWidth: number
  isSidebarCollapsed: boolean

  // 액션들
  setNavOpen: () => void
  setNavClose: () => void
  toggleNav: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setSidebarWidth: (width: number) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  reset: () => void
}

const initialState = {
  isNavOpen: true,
  isMobileMenuOpen: false,
  sidebarWidth: 280,
  isSidebarCollapsed: false,
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setNavOpen: () => {
        set({ isNavOpen: true })
      },

      setNavClose: () => {
        set({ isNavOpen: false })
      },

      toggleNav: () => {
        set((state) => ({ isNavOpen: !state.isNavOpen }))
      },

      setMobileMenuOpen: (open: boolean) => {
        set({ isMobileMenuOpen: open })
      },

      toggleMobileMenu: () => {
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }))
      },

      setSidebarWidth: (width: number) => {
        set({ sidebarWidth: Math.max(200, Math.min(400, width)) })
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ isSidebarCollapsed: collapsed })
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'layout-storage',
      partialize: (state) => ({
        isNavOpen: state.isNavOpen,
        sidebarWidth: state.sidebarWidth,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
)

// 편의 훅들
export const useNavigation = () => {
  const isNavOpen = useLayoutStore((state) => state.isNavOpen)
  const setNavOpen = useLayoutStore((state) => state.setNavOpen)
  const setNavClose = useLayoutStore((state) => state.setNavClose)
  const toggleNav = useLayoutStore((state) => state.toggleNav)

  return { isNavOpen, setNavOpen, setNavClose, toggleNav }
}

export const useMobileMenu = () => {
  const isMobileMenuOpen = useLayoutStore((state) => state.isMobileMenuOpen)
  const setMobileMenuOpen = useLayoutStore((state) => state.setMobileMenuOpen)
  const toggleMobileMenu = useLayoutStore((state) => state.toggleMobileMenu)

  return { isMobileMenuOpen, setMobileMenuOpen, toggleMobileMenu }
}

export const useSidebar = () => {
  const sidebarWidth = useLayoutStore((state) => state.sidebarWidth)
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed)
  const setSidebarWidth = useLayoutStore((state) => state.setSidebarWidth)
  const setSidebarCollapsed = useLayoutStore(
    (state) => state.setSidebarCollapsed,
  )
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)

  return {
    sidebarWidth,
    isSidebarCollapsed,
    setSidebarWidth,
    setSidebarCollapsed,
    toggleSidebar,
  }
}
