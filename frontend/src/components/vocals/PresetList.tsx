import type { VoicePreset } from '../../types/media'

interface PresetListProps {
  presets: VoicePreset[]
  selected: VoicePreset
  onSelect: (preset: VoicePreset) => void
}

export function PresetList({ presets, selected, onSelect }: PresetListProps) {
  return (
    <div className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Modes</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Presets</h2>
      <div className="mt-6 space-y-3">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
              preset.label === selected.label
                ? 'border-[var(--mf-accent)] bg-[var(--mf-accent-soft)]'
                : 'border-white/10 bg-black/20 hover:bg-white/[0.04]'
            }`}
            onClick={() => onSelect(preset)}
          >
            <div className="text-sm font-medium text-white/85">{preset.label}</div>
            <div className="mt-1 text-xs text-white/45">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
