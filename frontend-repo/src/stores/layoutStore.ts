import { create } from 'zustand'

interface LayoutState {
  isNavOpen: boolean
  setNavOpen: () => void
  setNavClose: () => void
  toggleNav: () => void
}
export const useLayoutStore = create<LayoutState>((set) => ({
  isNavOpen: true,
  setNavOpen: () => {
    set({
      isNavOpen: true,
    })
  },
  setNavClose: () => {
    set({
      isNavOpen: false,
    })
  },
  toggleNav: () => {
    set((state) => ({
      isNavOpen: !state.isNavOpen,
    }))
  },
}))
