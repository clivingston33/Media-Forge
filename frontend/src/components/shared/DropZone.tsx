import { Upload } from 'lucide-react'
import type { DragEvent } from 'react'

interface DropZoneProps {
  title: string
  description: string
  accept?: string
  fileName?: string | null
  onFileSelect: (file: File) => void
}

export function DropZone({ title, description, accept, fileName, onFileSelect }: DropZoneProps) {
  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files.item(0)

    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <label
      className="mf-subpanel flex min-h-56 cursor-pointer flex-col items-center justify-center px-6 py-10 text-center transition hover:border-white/20 hover:bg-white/[0.06]"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        className="hidden"
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.currentTarget.files?.item(0)
          if (file) {
            onFileSelect(file)
          }
        }}
      />
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <Upload className="h-6 w-6 text-white/70" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/50">{description}</p>
      <div className="mt-4 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">
        {fileName ? `Loaded: ${fileName}` : 'Drop a file or click to browse'}
      </div>
    </label>
  )
}
