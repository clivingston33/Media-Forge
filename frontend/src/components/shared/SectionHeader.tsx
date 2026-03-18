import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow: string
  title: string
  description?: string
  aside?: ReactNode
}

export function SectionHeader({ eyebrow, title, description, aside }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-white/35">{eyebrow}</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">{description}</p> : null}
      </div>
      {aside}
    </div>
  )
}
