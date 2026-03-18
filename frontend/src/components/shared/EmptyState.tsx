import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="mf-subpanel flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <Inbox className="h-6 w-6 text-white/60" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/50">{description}</p>
    </div>
  )
}
