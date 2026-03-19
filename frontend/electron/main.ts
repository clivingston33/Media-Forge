import { app, BrowserWindow, dialog } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { startManagedBackend, type ManagedBackend } from './backend.js'
import { initializeElectronObservability } from './observability.js'
import { registerDialogHandlers } from './ipc/dialogs.js'
import { registerRuntimeHandlers } from './ipc/runtime.js'
import { registerShellHandlers } from './ipc/shell.js'
import { attachWindowLogging, createElectronLogger, registerCrashLogging } from './logging.js'
import { loadRuntimeConfig } from './runtime-config.js'
import { DesktopRuntimeManager } from './updater.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const runtimeConfig = loadRuntimeConfig()
const observability = initializeElectronObservability(app.getVersion(), runtimeConfig)

let managedBackend: ManagedBackend | null = null
let desktopRuntimeManager: DesktopRuntimeManager | null = null

function createWindow() {
  const browserWindow = new BrowserWindow({
    width: 1520,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#090d11',
    title: 'MediaForge',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL

  if (devServerUrl) {
    browserWindow.loadURL(devServerUrl)
    browserWindow.webContents.openDevTools({ mode: 'detach' })
    return browserWindow
  }

  browserWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  return browserWindow
}

app.whenReady().then(async () => {
  const logger = createElectronLogger(app)
  registerCrashLogging(app, logger, observability.captureException)
  registerDialogHandlers()
  registerShellHandlers()
  desktopRuntimeManager = new DesktopRuntimeManager({
    appVersion: app.getVersion(),
    logger,
    observability,
    runtimeConfig,
  })
  registerRuntimeHandlers(desktopRuntimeManager)

  logger.info('desktop_runtime_ready', {
    release: runtimeConfig.release,
    releaseChannel: runtimeConfig.releaseChannel,
    crashReportingEnabled: observability.state.enabled,
    updaterProvider: runtimeConfig.autoUpdates.provider,
  })

  try {
    managedBackend = await startManagedBackend(logger, { runtimeConfig })
  } catch (error) {
    logger.error('backend_boot_failed', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    observability.captureException(error, { surface: 'backend_boot' })
    dialog.showErrorBox(
      'MediaForge Startup Failed',
      `The local backend could not be started.\n\n${error instanceof Error ? error.message : String(error)}\n\nLogs: ${logger.logDirectory}`,
    )
    app.quit()
    return
  }

  const browserWindow = createWindow()
  desktopRuntimeManager.attachWindow(browserWindow)
  desktopRuntimeManager.start()
  attachWindowLogging(browserWindow, logger, observability.captureException)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const nextWindow = createWindow()
      desktopRuntimeManager?.attachWindow(nextWindow)
      attachWindowLogging(nextWindow, logger, observability.captureException)
    }
  })
})

app.on('before-quit', () => {
  managedBackend?.stop()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
