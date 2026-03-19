import { AlertTriangle, CheckCircle2, Cpu, FolderOpen, Gauge, Wrench, XCircle } from 'lucide-react'
import { useActiveTaskCount } from '../../features/jobs/hooks'
import { useSettingsStore } from '../../store/settingsStore'
import { useSystemHealthStore } from '../../store/systemHealthStore'
import type { HealthCheckStatus } from '../../types/health'

const toneMap: Record<HealthCheckStatus, string> = {
  ready: 'border-[#284f41] bg-[#102920] text-[#8af0be]',
  degraded: 'border-[#5a4720] bg-[#241b0c] text-[#ffd27d]',
  missing: 'border-[#5b2929] bg-[#271214] text-[#ff9d9d]',
}

const iconMap = {
  ready: CheckCircle2,
  degraded: AlertTriangle,
  missing: XCircle,
} satisfies Record<HealthCheckStatus, typeof CheckCircle2>

export function SystemCard() {
  const activeCount = useActiveTaskCount()
  const systemHealth = useSystemHealthStore((state) => ({
    health: state.health,
    loading: state.loading,
    error: state.error,
  }))
  const settings = useSettingsStore((state) => ({
    gpuAcceleration: state.gpu_acceleration,
    outputFolder: state.output_folder,
    queueConcurrency: state.queue_concurrency,
  }))

  const featureStatuses = systemHealth.health?.features ?? []
  const toolStatuses =
    systemHealth.health?.checks.filter((check) => ['ffmpeg', 'yt_dlp', 'demucs', 'rembg'].includes(check.key)) ?? []
  const overallStatus: HealthCheckStatus = systemHealth.health?.status === 'ok' ? 'ready' : 'degraded'
  const OverallIcon = iconMap[overallStatus]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">System</div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
          <OverallIcon className={`h-4 w-4 ${overallStatus === 'ready' ? 'text-[#8af0be]' : 'text-[#ffd27d]'}`} />
          <div className="min-w-0">
            <div className="text-xs text-white/45">Backend Readiness</div>
            <div className="text-sm font-medium">
              {systemHealth.loading && !systemHealth.health
                ? 'Checking toolchain...'
                : systemHealth.health?.status === 'ok'
                  ? 'All core features ready'
                  : 'Degraded'}
            </div>
            {systemHealth.error ? <div className="truncate text-xs text-[#ff9d9d]">{systemHealth.error}</div> : null}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
          <Cpu className="h-4 w-4 text-[var(--mf-accent)]" />
          <div>
            <div className="text-xs text-white/45">GPU Acceleration</div>
            <div className="text-sm font-medium">{settings.gpuAcceleration ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
          <Gauge className="h-4 w-4 text-[#7cc7ff]" />
          <div>
            <div className="text-xs text-white/45">Queue</div>
            <div className="text-sm font-medium">
              {activeCount} active - concurrency {settings.queueConcurrency}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
          <FolderOpen className="h-4 w-4 text-[#63d1ab]" />
          <div>
            <div className="text-xs text-white/45">Output Folder</div>
            <div className="truncate text-sm font-medium">{settings.outputFolder}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
            <Wrench className="h-3.5 w-3.5" />
            Feature Readiness
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {featureStatuses.map((feature) => {
              const Icon = iconMap[feature.status]

              return (
                <div key={feature.key} className={`rounded-xl border px-2.5 py-2 ${toneMap[feature.status]}`}>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Icon className="h-3.5 w-3.5" />
                    {feature.label}
                  </div>
                  <div className="mt-1 text-[11px] leading-4 opacity-80">{feature.detail}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">Toolchain</div>
          <div className="mt-3 space-y-2">
            {toolStatuses.map((tool) => {
              const Icon = iconMap[tool.status]

              return (
                <div
                  key={tool.key}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{tool.label}</div>
                    <div className="truncate text-[11px] text-white/45">{tool.detail}</div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${toneMap[tool.status]}`}
                  >
                    <Icon className="h-3 w-3" />
                    {tool.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
