interface RefinementPanelProps {
  disabled: boolean
  busy?: boolean
  error?: string | null
  onSubmit: () => void
}

export function RefinementPanel({ disabled, busy, error, onSubmit }: RefinementPanelProps) {
  return (
    <div className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Controls</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Refinement</h2>
      <div className="mt-6 space-y-4 text-sm text-white/65">
        {[
          ['Edge smoothing', 'Medium'],
          ['Shadow cleanup', 'Balanced'],
          ['Background fill', 'Transparent'],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4" key={label}>
            <div className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</div>
            <div className="mt-2 font-medium text-white/85">{value}</div>
          </div>
        ))}
      </div>
      <button className="mf-primary-button mt-6 w-full" disabled={disabled} onClick={onSubmit}>
        {busy ? 'Queuing...' : 'Remove Background'}
      </button>
      {error ? <div className="mt-4 text-sm text-[#ffc2c2]">{error}</div> : null}
    </div>
  )
}
