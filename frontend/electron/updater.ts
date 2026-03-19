import { app, BrowserWindow } from 'electron'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import type { ElectronObservability } from './observability.js'
import type { ElectronLogger } from './logging.js'
import type { RuntimeConfig } from './runtime-config.js'

const require = createRequire(import.meta.url)
const { autoUpdater } = require('electron-updater') as typeof import('electron-updater')

export type AutoUpdateStatus = 'disabled' | 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'

export interface DesktopRuntimeState {
  appVersion: string
  isPackaged: boolean
  releaseChannel: string
  crashReportingEnabled: boolean
  backendCrashReportingEnabled: boolean
  updaterConfigured: boolean
  updaterProvider: string
  updaterStatus: AutoUpdateStatus
  updaterMessage: string
  availableVersion: string | null
  downloadProgress: number | null
  lastCheckedAt: string | null
}

interface DesktopRuntimeManagerOptions {
  appVersion: string
  logger: ElectronLogger
  observability: ElectronObservability
  runtimeConfig: RuntimeConfig
}

function resolveAppUpdateConfigPath() {
  return path.join(process.resourcesPath, 'app-update.yml')
}

export class DesktopRuntimeManager {
  private readonly windows = new Set<BrowserWindow>()
  private readonly state: DesktopRuntimeState
  private readonly logger: ElectronLogger
  private readonly observability: ElectronObservability
  private started = false

  constructor(private readonly options: DesktopRuntimeManagerOptions) {
    const updaterConfigured =
      options.runtimeConfig.autoUpdates.enabled && app.isPackaged && fs.existsSync(resolveAppUpdateConfigPath())

    this.logger = options.logger
    this.observability = options.observability
    this.state = {
      appVersion: options.appVersion,
      isPackaged: app.isPackaged,
      releaseChannel: options.runtimeConfig.releaseChannel,
      crashReportingEnabled: options.observability.state.enabled,
      backendCrashReportingEnabled: Boolean(options.runtimeConfig.sentry.backendDsn || options.runtimeConfig.sentry.dsn),
      updaterConfigured,
      updaterProvider: options.runtimeConfig.autoUpdates.provider,
      updaterStatus: updaterConfigured ? 'idle' : 'disabled',
      updaterMessage: updaterConfigured
        ? 'Ready to check for updates from the release feed.'
        : app.isPackaged
          ? 'Update feed is not packaged into this build.'
          : 'Auto updates are only available in installed desktop builds.',
      availableVersion: null,
      downloadProgress: null,
      lastCheckedAt: null,
    }
  }

  attachWindow(browserWindow: BrowserWindow) {
    this.windows.add(browserWindow)
    browserWindow.on('closed', () => {
      this.windows.delete(browserWindow)
    })
  }

  getState(): DesktopRuntimeState {
    return { ...this.state }
  }

  start() {
    if (this.started || !this.state.updaterConfigured) {
      return
    }

    this.started = true
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.allowPrerelease = this.options.runtimeConfig.releaseChannel !== 'stable'

    autoUpdater.on('checking-for-update', () => {
      this.patchState({
        updaterStatus: 'checking',
        updaterMessage: 'Checking for updates...',
        lastCheckedAt: new Date().toISOString(),
        downloadProgress: null,
      })
    })

    autoUpdater.on('update-available', (info) => {
      this.patchState({
        updaterStatus: 'available',
        updaterMessage: `Update ${info.version} is available. Downloading now...`,
        availableVersion: info.version,
      })
    })

    autoUpdater.on('update-not-available', () => {
      this.patchState({
        updaterStatus: 'idle',
        updaterMessage: 'You are on the latest available version.',
        availableVersion: null,
        downloadProgress: null,
      })
    })

    autoUpdater.on('download-progress', (progress) => {
      this.patchState({
        updaterStatus: 'downloading',
        updaterMessage: `Downloading update (${progress.percent.toFixed(1)}%).`,
        downloadProgress: Number(progress.percent.toFixed(1)),
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      this.patchState({
        updaterStatus: 'downloaded',
        updaterMessage: `Update ${info.version} is ready to install.`,
        availableVersion: info.version,
        downloadProgress: 100,
      })
    })

    autoUpdater.on('error', (error) => {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error('auto_update_error', { message })
      this.observability.captureException(error, { surface: 'desktop_updater' })
      this.patchState({
        updaterStatus: 'error',
        updaterMessage: message,
      })
    })

    setTimeout(() => {
      void this.checkForUpdates()
    }, 15000)
  }

  async checkForUpdates() {
    if (!this.state.updaterConfigured) {
      return this.getState()
    }

    await autoUpdater.checkForUpdates()
    return this.getState()
  }

  quitAndInstall() {
    if (this.state.updaterStatus !== 'downloaded') {
      return
    }

    autoUpdater.quitAndInstall()
  }

  private patchState(nextState: Partial<DesktopRuntimeState>) {
    Object.assign(this.state, nextState)
    this.broadcast()
  }

  private broadcast() {
    const snapshot = this.getState()
    for (const browserWindow of this.windows) {
      if (!browserWindow.isDestroyed()) {
        browserWindow.webContents.send('mediaforge:runtime-state-changed', snapshot)
      }
    }
  }
}
