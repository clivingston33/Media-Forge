import { create } from 'zustand'

interface UiState {
  sidebarCompact: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCompact: false,
  toggleSidebar: () => set((state) => ({ sidebarCompact: !state.sidebarCompact })),
}))
