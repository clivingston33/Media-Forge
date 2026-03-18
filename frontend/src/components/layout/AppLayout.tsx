import type { PropsWithChildren } from 'react'
import type { MediaForgeRoute } from '../../app/routes'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppLayoutProps extends PropsWithChildren {
  route: MediaForgeRoute
}

export function AppLayout({ route, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Topbar route={route} />
          {children}
        </div>
      </main>
    </div>
  )
}
