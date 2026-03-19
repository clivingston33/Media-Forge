import { ClipboardPaste } from 'lucide-react'

interface UrlInputCardProps {
  value: string
  busy: boolean
  error?: string | null
  onChange: (value: string) => void
  onPaste: () => void
  onSubmit: () => void
}

export function UrlInputCard({ value, busy, error, onChange, onPaste, onSubmit }: UrlInputCardProps) {
  return (
    <div className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Input</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Link import</h2>
      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
        <div className="mb-3 text-sm font-medium text-white/75">YouTube or direct media URL</div>
        <div className="flex flex-col gap-3 xl:flex-row">
          <input
            className="mf-input flex-1"
            value={value}
            placeholder="https://youtube.com/watch?v=..."
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="flex gap-3">
            <button className="mf-action-button inline-flex items-center gap-2" onClick={onPaste} type="button">
              <ClipboardPaste className="h-4 w-4" />
              Paste
            </button>
            <button className="mf-primary-button" disabled={busy || !value.trim()} onClick={onSubmit} type="button">
              {busy ? 'Queuing...' : 'Fetch'}
            </button>
          </div>
        </div>
      </div>
      {error ? <div className="mt-4 text-sm text-[#ffc2c2]">{error}</div> : null}
    </div>
  )
}
