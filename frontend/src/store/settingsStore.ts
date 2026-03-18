import { create } from 'zustand'
import { api } from '../lib/api'
import { DEFAULT_SETTINGS } from '../lib/constants'
import type { AppSettings } from '../types/settings'

interface SettingsState extends AppSettings {
  loading: boolean
  setPartial: (settings: Partial<AppSettings>) => void
  hydrate: () => Promise<void>
  save: (settings: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loading: false,
  setPartial: (settings) => set(settings),
  hydrate: async () => {
    set({ loading: true })

    try {
      const settings = await api.getSettings()
      set({ ...settings, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  save: async (settings) => {
    const current = get()
    set({
      loading: true,
      gpu_acceleration: settings.gpu_acceleration ?? current.gpu_acceleration,
      output_folder: settings.output_folder ?? current.output_folder,
      queue_concurrency: settings.queue_concurrency ?? current.queue_concurrency,
      temp_cache_gb: settings.temp_cache_gb ?? current.temp_cache_gb,
      auto_save_exports: settings.auto_save_exports ?? current.auto_save_exports,
    })

    try {
      const persisted = await api.updateSettings(settings)
      set({ ...persisted, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))
