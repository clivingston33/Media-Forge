import type { AppSettings } from '../../types/settings'

interface GeneralSettingsCardProps {
  settings: AppSettings
  onToggle: (key: 'gpu_acceleration' | 'auto_save_exports') => void
  onConcurrencyChange: (value: number) => void
  onPickFolder: () => void
}

export function GeneralSettingsCard({
  settings,
  onToggle,
  onConcurrencyChange,
  onPickFolder,
}: GeneralSettingsCardProps) {
  return (
    <div className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Application</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">General settings</h2>
      <div className="mt-6 space-y-3">
        <button
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left text-sm text-white/75"
          onClick={() => onToggle('gpu_acceleration')}
          type="button"
        >
          <span>GPU acceleration</span>
          <span>{settings.gpu_acceleration ? 'Enabled' : 'Disabled'}</span>
        </button>
        <button
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left text-sm text-white/75"
          onClick={() => onToggle('auto_save_exports')}
          type="button"
        >
          <span>Auto-save exports</span>
          <span>{settings.auto_save_exports ? 'Enabled' : 'Disabled'}</span>
        </button>
        <button
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left text-sm text-white/75"
          onClick={onPickFolder}
          type="button"
        >
          <span>Default output folder</span>
          <span className="truncate pl-6">{settings.output_folder}</span>
        </button>
        <label className="block rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/75">
          <div className="mb-3 flex items-center justify-between">
            <span>Queue concurrency</span>
            <span>{settings.queue_concurrency}</span>
          </div>
          <input
            className="w-full accent-[var(--mf-accent)]"
            max={4}
            min={1}
            type="range"
            value={settings.queue_concurrency}
            onChange={(event) => onConcurrencyChange(Number(event.target.value))}
          />
        </label>
      </div>
    </div>
  )
}
