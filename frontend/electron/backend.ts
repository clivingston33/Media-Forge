import { app } from 'electron'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type { ElectronLogger } from './logging.js'
import type { RuntimeConfig } from './runtime-config.js'

const BACKEND_PORT = process.env.MEDIAFORGE_PORT ?? '8000'
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`

export interface ManagedBackend {
  baseUrl: string
  managed: boolean
  stop: () => void
}

interface ManagedBackendOptions {
  runtimeConfig: RuntimeConfig
}

function resolveBackendRoot() {
  if (process.env.MEDIAFORGE_BACKEND_ROOT) {
    return process.env.MEDIAFORGE_BACKEND_ROOT
  }

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend')
  }

  return path.resolve(__dirname, '../../backend')
}

function resolveBackendPython(backendRoot: string) {
  if (process.platform === 'win32') {
    return path.join(backendRoot, '.venv', 'Scripts', 'python.exe')
  }

  return path.join(backendRoot, '.venv', 'bin', 'python')
}

async function isBackendHealthy(baseUrl: string) {
  try {
    const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(3000) })
    return response.ok
  } catch {
    return false
  }
}

async function waitForBackend(baseUrl: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (await isBackendHealthy(baseUrl)) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`Backend did not become healthy within ${timeoutMs}ms.`)
}

function pipeBackendLogs(process: ChildProcessWithoutNullStreams, logger: ElectronLogger) {
  process.stdout.on('data', (chunk) => {
    const text = chunk.toString('utf-8').trim()
    if (text) {
      logger.info('backend_stdout', { line: text })
    }
  })

  process.stderr.on('data', (chunk) => {
    const text = chunk.toString('utf-8').trim()
    if (text) {
      logger.error('backend_stderr', { line: text })
    }
  })
}

export async function startManagedBackend(logger: ElectronLogger, options: ManagedBackendOptions): Promise<ManagedBackend> {
  if (await isBackendHealthy(BACKEND_URL)) {
    logger.info('backend_reused', { baseUrl: BACKEND_URL })
    return {
      baseUrl: BACKEND_URL,
      managed: false,
      stop: () => undefined,
    }
  }

  const backendRoot = resolveBackendRoot()
  const pythonPath = resolveBackendPython(backendRoot)
  const entryPoint = path.join(backendRoot, 'start.py')
  const runtimeDir = path.join(app.getPath('userData'), 'backend-runtime')

  if (!fs.existsSync(backendRoot)) {
    throw new Error(`Backend root was not found at ${backendRoot}.`)
  }

  if (!fs.existsSync(pythonPath)) {
    throw new Error(`Backend Python runtime was not found at ${pythonPath}.`)
  }

  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Backend entrypoint was not found at ${entryPoint}.`)
  }

  fs.mkdirSync(runtimeDir, { recursive: true })

  logger.info('backend_starting', {
    backendRoot,
    pythonPath,
    runtimeDir,
    baseUrl: BACKEND_URL,
  })

  const backendProcess = spawn(pythonPath, [entryPoint], {
    cwd: backendRoot,
    env: {
      ...process.env,
      MEDIAFORGE_HOST: '127.0.0.1',
      MEDIAFORGE_PORT: BACKEND_PORT,
      MEDIAFORGE_RELOAD: '0',
      MEDIAFORGE_RUNTIME_DIR: runtimeDir,
      MEDIAFORGE_RELEASE: options.runtimeConfig.release,
      MEDIAFORGE_SENTRY_DSN: options.runtimeConfig.sentry.dsn ?? '',
      MEDIAFORGE_BACKEND_SENTRY_DSN: options.runtimeConfig.sentry.backendDsn ?? '',
      MEDIAFORGE_SENTRY_ENVIRONMENT: options.runtimeConfig.sentry.environment,
      MEDIAFORGE_SENTRY_TRACES_SAMPLE_RATE: String(options.runtimeConfig.sentry.tracesSampleRate),
      PYTHONUNBUFFERED: '1',
    },
    stdio: 'pipe',
  })

  pipeBackendLogs(backendProcess, logger)

  let exitedEarly = false
  backendProcess.once('exit', (code, signal) => {
    exitedEarly = true
    logger.warn('backend_exit', {
      code,
      signal,
    })
  })

  await waitForBackend(BACKEND_URL, 45000)

  if (exitedEarly) {
    throw new Error('Backend exited before the desktop shell finished starting.')
  }

  logger.info('backend_ready', { baseUrl: BACKEND_URL })

  return {
    baseUrl: BACKEND_URL,
    managed: true,
    stop: () => {
      if (!backendProcess.killed) {
        logger.info('backend_stopping', { pid: backendProcess.pid })
        backendProcess.kill()
      }
    },
  }
}
