import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface RuntimeConfig {
  release: string
  releaseChannel: string
  autoUpdates: {
    enabled: boolean
    provider: string
  }
  sentry: {
    dsn: string | null
    backendDsn: string | null
    environment: string
    tracesSampleRate: number
  }
}

const defaultRuntimeConfig: RuntimeConfig = {
  release: 'mediaforge@0.1.0',
  releaseChannel: 'stable',
  autoUpdates: {
    enabled: true,
    provider: 'github',
  },
  sentry: {
    dsn: null,
    backendDsn: null,
    environment: 'development',
    tracesSampleRate: 0.1,
  },
}

function resolveConfigPaths() {
  return [
    path.resolve(__dirname, '../build/runtime-config.json'),
    path.resolve(process.cwd(), 'build/runtime-config.json'),
  ]
}

function isRuntimeConfig(value: unknown): value is RuntimeConfig {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<RuntimeConfig>
  return Boolean(
    candidate.release &&
      candidate.releaseChannel &&
      candidate.autoUpdates &&
      candidate.sentry &&
      typeof candidate.autoUpdates.enabled === 'boolean' &&
      typeof candidate.autoUpdates.provider === 'string' &&
      typeof candidate.sentry.environment === 'string' &&
      typeof candidate.sentry.tracesSampleRate === 'number',
  )
}

export function loadRuntimeConfig(): RuntimeConfig {
  for (const candidate of resolveConfigPaths()) {
    if (!fs.existsSync(candidate)) {
      continue
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf-8')) as unknown
      if (isRuntimeConfig(parsed)) {
        return parsed
      }
    } catch {
      continue
    }
  }

  return defaultRuntimeConfig
}
