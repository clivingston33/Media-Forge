const WAVEFORM_BARS = [30, 48, 24, 66, 36, 52, 22, 70, 40, 58, 28, 78, 34, 60, 26, 72]

interface WaveformPanelProps {
  fileName?: string | null
}

export function WaveformPanel({ fileName }: WaveformPanelProps) {
  return (
    <div className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Audio Separation</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Speech and vocal isolation</h2>
      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
        <div className="mb-4 text-sm text-white/65">{fileName ? `Loaded: ${fileName}` : 'Waveform preview'}</div>
        <div className="flex h-40 items-end gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-6">
          {WAVEFORM_BARS.map((height, index) => (
            <div
              key={`${height}-${index}`}
              className="flex-1 rounded-full bg-[linear-gradient(180deg,rgba(124,199,255,0.95)_0%,rgba(244,184,96,0.85)_100%)]"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
