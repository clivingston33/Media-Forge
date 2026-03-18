import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')
const packageJson = JSON.parse(fs.readFileSync(path.join(frontendRoot, 'package.json'), 'utf-8'))
const buildDir = path.join(frontendRoot, 'build')
const runtimeConfigPath = path.join(buildDir, 'runtime-config.json')

function readOptionalEnv(name) {
  const value = process.env[name]?.trim()
  return value ? value : null
}

function readNumberEnv(name, fallback) {
  const value = Number(process.env[name] ?? '')
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

const environment =
  readOptionalEnv('MEDIAFORGE_SENTRY_ENVIRONMENT') ??
  (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' ? 'production' : 'development')

const releaseChannel = readOptionalEnv('MEDIAFORGE_RELEASE_CHANNEL') ?? 'stable'
const runtimeConfig = {
  generatedAt: new Date().toISOString(),
  release: `mediaforge@${packageJson.version}`,
  releaseChannel,
  autoUpdates: {
    enabled: (process.env.MEDIAFORGE_ENABLE_AUTO_UPDATES ?? '1') !== '0',
    provider: readOptionalEnv('MEDIAFORGE_UPDATE_PROVIDER') ?? 'github',
  },
  sentry: {
    dsn: readOptionalEnv('MEDIAFORGE_SENTRY_DSN'),
    backendDsn: readOptionalEnv('MEDIAFORGE_BACKEND_SENTRY_DSN'),
    environment,
    tracesSampleRate: readNumberEnv('MEDIAFORGE_SENTRY_TRACES_SAMPLE_RATE', 0.1),
  },
}

fs.mkdirSync(buildDir, { recursive: true })
fs.writeFileSync(runtimeConfigPath, `${JSON.stringify(runtimeConfig, null, 2)}\n`, 'utf-8')
console.log(`Generated ${runtimeConfigPath}`)
