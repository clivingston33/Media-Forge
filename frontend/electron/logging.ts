import type { App, BrowserWindow } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

export interface ElectronLogger {
  info: (event: string, payload?: Record<string, unknown>) => void
  warn: (event: string, payload?: Record<string, unknown>) => void
  error: (event: string, payload?: Record<string, unknown>) => void
  logDirectory: string
}

type ExceptionReporter = (error: unknown, context?: Record<string, unknown>) => void

function createWriter(logFilePath: string) {
  return (level: 'INFO' | 'WARN' | 'ERROR', event: string, payload?: Record<string, unknown>) => {
    const record = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...payload,
    }
    fs.appendFileSync(logFilePath, `${JSON.stringify(record)}\n`, 'utf-8')
  }
}

export function createElectronLogger(app: App): ElectronLogger {
  const logDirectory = path.join(app.getPath('userData'), 'logs')
  fs.mkdirSync(logDirectory, { recursive: true })

  const logFilePath = path.join(logDirectory, 'electron.log')
  const write = createWriter(logFilePath)

  return {
    logDirectory,
    info: (event, payload) => write('INFO', event, payload),
    warn: (event, payload) => write('WARN', event, payload),
    error: (event, payload) => write('ERROR', event, payload),
  }
}

export function registerCrashLogging(app: App, logger: ElectronLogger, reportException?: ExceptionReporter) {
  process.on('uncaughtException', (error) => {
    logger.error('uncaught_exception', {
      message: error.message,
      stack: error.stack,
    })
    reportException?.(error, { surface: 'electron_main', event: 'uncaught_exception' })
  })

  process.on('unhandledRejection', (reason) => {
    logger.error('unhandled_rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    })
    reportException?.(reason, { surface: 'electron_main', event: 'unhandled_rejection' })
  })

  app.on('render-process-gone', (_, webContents, details) => {
    logger.error('render_process_gone', {
      reason: details.reason,
      exitCode: details.exitCode,
      url: webContents.getURL(),
    })
    reportException?.(new Error(`Renderer process exited: ${details.reason}`), {
      surface: 'electron_renderer',
      event: 'render_process_gone',
      exitCode: details.exitCode,
      url: webContents.getURL(),
    })
  })
}

export function attachWindowLogging(browserWindow: BrowserWindow, logger: ElectronLogger, reportException?: ExceptionReporter) {
  browserWindow.webContents.on('unresponsive', () => {
    logger.warn('window_unresponsive', {
      title: browserWindow.getTitle(),
    })
  })

  browserWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    logger.error('window_failed_load', {
      errorCode,
      errorDescription,
      validatedURL,
    })
    reportException?.(new Error(`Window failed to load: ${errorDescription}`), {
      surface: 'electron_window',
      event: 'window_failed_load',
      errorCode,
      validatedURL,
    })
  })
}
