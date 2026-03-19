import { FolderSearch, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { MediaForgeRoute } from '../../app/routes'

interface TopbarProps {
  route: MediaForgeRoute
}

export function Topbar({ route }: TopbarProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">{route.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{route.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="mf-action-button inline-flex items-center gap-2" onClick={() => navigate('/queue')} type="button">
          <FolderSearch className="h-4 w-4" />
          Open Queue
        </button>
        <button className="mf-primary-button inline-flex items-center gap-2" onClick={() => navigate('/')} type="button">
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>
    </div>
  )
}
