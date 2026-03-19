import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getRouteByPath } from '../../app/routes'
import type { QuickAction } from '../../types/media'
import { SectionHeader } from '../shared/SectionHeader'

interface QuickActionGridProps {
  actions: QuickAction[]
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  const navigate = useNavigate()

  return (
    <div className="mf-panel p-6">
      <SectionHeader
        eyebrow="Quick Action"
        title="Create a new job"
        description="Jump into the four core tools from the dashboard and keep the queue flowing."
        aside={<div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50">Local processing</div>}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {actions.map((action) => {
          const route = getRouteByPath(action.route)
          const Icon = route.icon

          return (
            <button
              key={action.title}
              className="mf-subpanel group p-5 text-left transition hover:bg-white/[0.05]"
              onClick={() => navigate(action.route)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Icon className="h-5 w-5 text-[var(--mf-accent)]" />
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                  {action.eyebrow}
                </div>
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-tight">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">{action.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-white/70">
                Open workspace
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
