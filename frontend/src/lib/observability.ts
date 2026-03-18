let rendererObservabilityStarted = false

export async function initializeRendererObservability() {
  if (rendererObservabilityStarted || !window.mediaForge) {
    return
  }

  const Sentry = await import('@sentry/electron/renderer')
  Sentry.init()
  rendererObservabilityStarted = true
}
