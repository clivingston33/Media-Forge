import { ClipboardPaste, FileUp } from 'lucide-react'

interface QuickInputCardProps {
  url: string
  busy: boolean
  error?: string | null
  onUrlChange: (value: string) => void
  onAnalyze: () => void
  onPaste: () => void
  onFileSelect: (file: File) => void
}

export function QuickInputCard({
  url,
  busy,
  error,
  onUrlChange,
  onAnalyze,
  onPaste,
  onFileSelect,
}: QuickInputCardProps) {
  return (
    <div className="mf-panel p-6">
      <div className="mb-3 text-sm font-medium text-white/75">Paste URL or choose a file</div>
      <div className="flex flex-col gap-3 xl:flex-row">
        <input
          className="mf-input flex-1"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
        />
        <div className="flex gap-3">
          <button className="mf-action-button inline-flex items-center gap-2" onClick={onPaste} type="button">
            <ClipboardPaste className="h-4 w-4" />
            Paste
          </button>
          <button className="mf-primary-button" disabled={busy || !url.trim()} onClick={onAnalyze} type="button">
            {busy ? 'Queuing...' : 'Analyze'}
          </button>
        </div>
      </div>
      <label className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/65 transition hover:border-white/20 hover:bg-white/[0.04]">
        <FileUp className="h-4 w-4" />
        Queue local file
        <input
          className="hidden"
          type="file"
          onChange={(event) => {
            const file = event.currentTarget.files?.item(0)
            if (file) {
              onFileSelect(file)
            }
          }}
        />
      </label>
      {error ? <div className="mt-4 text-sm text-[#ffc2c2]">{error}</div> : null}
    </div>
  )
}
