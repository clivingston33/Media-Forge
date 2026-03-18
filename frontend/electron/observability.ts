import * as Sentry from '@sentry/electron/main'
import type { RuntimeConfig } from './runtime-config.js'

export interface ElectronObservabilityState {
  enabled: boolean
  environment: string
  release: string
}

export interface ElectronObservability {
  state: ElectronObservabilityState
  captureException: (error: unknown, context?: Record<string, unknown>) => void
}

export function initializeElectronObservability(appVersion: string, runtimeConfig: RuntimeConfig): ElectronObservability {
  const release = runtimeConfig.release || `mediaforge@${appVersion}`
  const state: ElectronObservabilityState = {
    enabled: Boolean(runtimeConfig.sentry.dsn),
    environment: runtimeConfig.sentry.environment,
    release,
  }

  if (state.enabled) {
    Sentry.init({
      dsn: runtimeConfig.sentry.dsn ?? undefined,
      release,
      environment: runtimeConfig.sentry.environment,
      tracesSampleRate: runtimeConfig.sentry.tracesSampleRate,
    })
  }

  return {
    state,
    captureException: (error, context) => {
      if (!state.enabled) {
        return
      }

      Sentry.withScope((scope) => {
        for (const [key, value] of Object.entries(context ?? {})) {
          scope.setExtra(key, value)
        }
        Sentry.captureException(error)
      })
    },
  }
}
