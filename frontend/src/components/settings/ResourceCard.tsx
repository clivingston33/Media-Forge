import type { AppSettings } from '../../types/settings'
import type { DesktopRuntimeState } from '../../types/runtime'

interface ResourceCardProps {
  settings: AppSettings
  runtime: DesktopRuntimeState
  runtimeLoading: boolean
  runtimeError: string | null
  onCheckForUpdates?: () => void
  onInstallUpdate?: () => void
  onOpenLogs?: () => void
}

function getCrashReportingLabel(runtime: DesktopRuntimeState) {
  if (!runtime.crashReportingEnabled && !runtime.backendCrashReportingEnabled) {
    return 'Disabled'
  }

  if (runtime.crashReportingEnabled && runtime.backendCrashReportingEnabled) {
    return 'Desktop + backend enabled'
  }

  return runtime.crashReportingEnabled ? 'Desktop enabled' : 'Backend enabled'
}

export function ResourceCard({
  settings,
  runtime,
  runtimeLoading,
  runtimeError,
  onCheckForUpdates,
  onInstallUpdate,
  onOpenLogs,
}: ResourceCardProps) {
  const updatesBusy = runtime.updaterStatus === 'checking' || runtime.updaterStatus === 'downloading'

  return (
    <div className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Performance</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Resources</h2>
      <div className="mt-6 space-y-3">
        {[
          ['GPU', settings.gpu_acceleration ? 'Enabled' : 'Disabled'],
          ['Queue concurrency', String(settings.queue_concurrency)],
          ['Temp cache', `${settings.temp_cache_gb.toFixed(1)} GB`],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/60" key={label}>
            <div className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</div>
            <div className="mt-2 font-medium text-white/85">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
        <div className="text-xs uppercase tracking-[0.18em] text-white/35">Desktop Runtime</div>
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            <div className="text-xs uppercase tracking-[0.18em] text-white/35">App Version</div>
            <div className="mt-2 font-medium text-white/85">
              {runtime.appVersion} · {runtime.releaseChannel}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            <div className="text-xs uppercase tracking-[0.18em] text-white/35">Crash Reporting</div>
            <div className="mt-2 font-medium text-white/85">
              {runtimeLoading ? 'Checking...' : getCrashReportingLabel(runtime)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            <div className="text-xs uppercase tracking-[0.18em] text-white/35">Auto Updates</div>
            <div className="mt-2 font-medium text-white/85">
              {runtime.updaterConfigured ? runtime.updaterStatus : 'Unavailable'}
            </div>
            <div className="mt-1 text-xs text-white/45">{runtime.updaterMessage}</div>
            {runtime.availableVersion ? (
              <div className="mt-1 text-xs text-[var(--mf-accent-soft)]">Latest release: {runtime.availableVersion}</div>
            ) : null}
            {runtime.lastCheckedAt ? (
              <div className="mt-1 text-[11px] text-white/35">
                Last checked {new Date(runtime.lastCheckedAt).toLocaleString()}
              </div>
            ) : null}
          </div>
        </div>
        {runtimeError ? <div className="mt-3 text-xs text-[#ff9d9d]">{runtimeError}</div> : null}
      </div>

      <div className="mt-6 space-y-3">
        <button
          className="mf-action-button w-full disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!runtime.updaterConfigured || updatesBusy}
          onClick={onCheckForUpdates}
          type="button"
        >
          {updatesBusy ? 'Checking Release Feed...' : 'Check For Updates'}
        </button>
        {runtime.updaterStatus === 'downloaded' ? (
          <button className="mf-action-button w-full" onClick={onInstallUpdate} type="button">
            Restart To Install Update
          </button>
        ) : null}
      </div>

      <button className="mf-action-button mt-6 w-full" onClick={onOpenLogs} type="button">
        Open Logs Folder
      </button>
    </div>
  )
}
