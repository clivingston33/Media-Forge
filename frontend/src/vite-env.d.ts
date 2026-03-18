/// <reference types="vite/client" />

interface DesktopRuntimeState {
  appVersion: string
  isPackaged: boolean
  releaseChannel: string
  crashReportingEnabled: boolean
  backendCrashReportingEnabled: boolean
  updaterConfigured: boolean
  updaterProvider: string
  updaterStatus: 'disabled' | 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
  updaterMessage: string
  availableVersion: string | null
  downloadProgress: number | null
  lastCheckedAt: string | null
}

interface MediaForgeBridge {
  pickOutputFolder: () => Promise<string | null>
  revealInFolder: (path: string) => Promise<void>
  openLogsFolder: () => Promise<void>
  getRuntimeState: () => Promise<DesktopRuntimeState>
  checkForUpdates: () => Promise<DesktopRuntimeState>
  quitAndInstallUpdate: () => Promise<void>
  onRuntimeStateChange: (callback: (state: DesktopRuntimeState) => void) => () => void
}

interface Window {
  mediaForge?: MediaForgeBridge
}
