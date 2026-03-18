import { create } from 'zustand'
import { api } from '../lib/api'
import type { SystemHealth } from '../types/health'

interface SystemHealthState {
  health: SystemHealth | null
  loading: boolean
  error: string | null
  refresh: (forceRefresh?: boolean) => Promise<void>
}

export const useSystemHealthStore = create<SystemHealthState>((set) => ({
  health: null,
  loading: false,
  error: null,
  refresh: async (forceRefresh = false) => {
    set((state) => ({
      loading: state.health === null,
      error: null,
    }))

    try {
      const health = await api.health(forceRefresh)
      set({
        health,
        loading: false,
        error: null,
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load system health.',
      })
    }
  },
}))
