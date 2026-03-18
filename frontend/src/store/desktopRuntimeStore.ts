import { create } from 'zustand'
import type { DesktopRuntimeState } from '../types/runtime'

const browserFallbackRuntime: DesktopRuntimeState = {
  appVersion: 'dev',
  isPackaged: false,
  releaseChannel: 'local',
  crashReportingEnabled: false,
  backendCrashReportingEnabled: false,
  updaterConfigured: false,
  updaterProvider: 'github',
  updaterStatus: 'disabled',
  updaterMessage: 'Desktop runtime features are only available in the Electron shell.',
  availableVersion: null,
  downloadProgress: null,
  lastCheckedAt: null,
}

interface DesktopRuntimeStore {
  runtime: DesktopRuntimeState
  loading: boolean
  error: string | null
  setRuntime: (runtime: DesktopRuntimeState) => void
  hydrate: () => Promise<void>
  checkForUpdates: () => Promise<void>
  quitAndInstallUpdate: () => Promise<void>
}

export const useDesktopRuntimeStore = create<DesktopRuntimeStore>((set) => ({
  runtime: browserFallbackRuntime,
  loading: false,
  error: null,
  setRuntime: (runtime) => set({ runtime, error: null }),
  hydrate: async () => {
    if (!window.mediaForge) {
      set({ runtime: browserFallbackRuntime, loading: false, error: null })
      return
    }

    set({ loading: true })

    try {
      const runtime = await window.mediaForge.getRuntimeState()
      set({ runtime, loading: false, error: null })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to read desktop runtime state.',
      })
    }
  },
  checkForUpdates: async () => {
    if (!window.mediaForge) {
      return
    }

    set({ loading: true, error: null })

    try {
      const runtime = await window.mediaForge.checkForUpdates()
      set({ runtime, loading: false, error: null })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to check for updates.',
      })
    }
  },
  quitAndInstallUpdate: async () => {
    if (!window.mediaForge) {
      return
    }

    await window.mediaForge.quitAndInstallUpdate()
  },
}))
