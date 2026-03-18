import type { ReactNode } from 'react'
import { FileText } from 'lucide-react'

interface FileCardProps {
  name: string
  caption: string
  aside?: ReactNode
}

export function FileCard({ name, caption, aside }: FileCardProps) {
  return (
    <div className="mf-subpanel flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <FileText className="h-5 w-5 text-white/70" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white/90">{name}</div>
          <div className="mt-1 text-xs text-white/45">{caption}</div>
        </div>
      </div>
      {aside}
    </div>
  )
}
