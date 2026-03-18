interface PreviewPanelProps {
  originalUrl?: string
  processedUrl?: string
}

function PreviewFrame({ label, imageUrl, transparent = false }: { label: string; imageUrl?: string; transparent?: boolean }) {
  return (
    <div className="mf-subpanel p-4">
      <div className="mb-3 text-sm font-medium text-white/70">{label}</div>
      <div
        className={`flex min-h-72 items-center justify-center rounded-[20px] border border-dashed border-white/10 ${
          transparent ? 'bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_1px,_transparent_1px)] [background-size:18px_18px]' : 'bg-white/[0.02]'
        }`}
      >
        {imageUrl ? (
          <img className="max-h-72 rounded-[18px] object-cover" src={imageUrl} alt={label} />
        ) : (
          <div className="text-sm text-white/35">{label} preview</div>
        )}
      </div>
    </div>
  )
}

export function PreviewPanel({ originalUrl, processedUrl }: PreviewPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PreviewFrame label="Original Preview" imageUrl={originalUrl} />
      <PreviewFrame label="Transparent Output" imageUrl={processedUrl} transparent />
    </div>
  )
}
