export type UpdaterStatus = 'disabled' | 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'

export interface DesktopRuntimeState {
  appVersion: string
  isPackaged: boolean
  releaseChannel: string
  crashReportingEnabled: boolean
  backendCrashReportingEnabled: boolean
  updaterConfigured: boolean
  updaterProvider: string
  updaterStatus: UpdaterStatus
  updaterMessage: string
  availableVersion: string | null
  downloadProgress: number | null
  lastCheckedAt: string | null
}
