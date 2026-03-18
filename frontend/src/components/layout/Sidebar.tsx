import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { APP_ROUTES } from '../../app/routes'
import { useUiStore } from '../../store/uiStore'
import { SystemCard } from './SystemCard'

export function Sidebar() {
  const sidebarCompact = useUiStore((state) => state.sidebarCompact)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <aside
      className={`border-r border-white/10 bg-[var(--mf-sidebar)] px-5 py-6 backdrop-blur-xl transition-all ${
        sidebarCompact ? 'w-24' : 'w-80'
      }`}
    >
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="h-5 w-5 rounded-full border border-[var(--mf-accent)]" />
          </div>
          {!sidebarCompact ? (
            <div className="min-w-0">
              <div className="text-sm text-white/45">Desktop Suite</div>
              <div className="truncate text-xl font-semibold tracking-tight">MediaForge</div>
            </div>
          ) : null}
        </div>
        <button className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white/70" onClick={toggleSidebar}>
          {sidebarCompact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-1.5">
        {APP_ROUTES.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? 'bg-white text-black shadow-[0_12px_30px_rgba(255,255,255,0.12)]'
                    : 'text-white/65 hover:bg-white/[0.04] hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCompact ? <span>{item.label}</span> : null}
            </NavLink>
          )
        })}
      </nav>

      {!sidebarCompact ? (
        <div className="mt-10">
          <SystemCard />
        </div>
      ) : null}
    </aside>
  )
}
