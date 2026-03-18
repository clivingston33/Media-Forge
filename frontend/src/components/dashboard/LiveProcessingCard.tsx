import { formatProgress, formatTool } from '../../lib/formatters'
import type { Task } from '../../types/task'
import { EmptyState } from '../shared/EmptyState'
import { ProgressBar } from '../shared/ProgressBar'
import { SectionHeader } from '../shared/SectionHeader'
import { StatusPill } from '../shared/StatusPill'

interface LiveProcessingCardProps {
  tasks: Task[]
}

export function LiveProcessingCard({ tasks }: LiveProcessingCardProps) {
  const activeTasks = tasks.filter((task) => task.status === 'queued' || task.status === 'processing').slice(0, 4)

  if (activeTasks.length === 0) {
    return (
      <div className="mf-panel p-6">
        <SectionHeader eyebrow="Queue" title="Live processing" />
        <div className="mt-6">
          <EmptyState title="Queue is clear" description="Kick off a download, conversion, or cleanup job to see live progress here." />
        </div>
      </div>
    )
  }

  return (
    <div className="mf-panel p-6">
      <SectionHeader eyebrow="Queue" title="Live processing" />
      <div className="mt-6 space-y-4">
        {activeTasks.map((task) => (
          <div className="mf-subpanel p-4" key={task.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white/85">{task.name}</div>
                <div className="mt-1 text-xs text-white/40">{formatTool(task.type)}</div>
              </div>
              <StatusPill status={task.status} />
            </div>
            <div className="mt-4">
              <ProgressBar value={task.progress} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/45">
              <span>{task.stage || 'Waiting in the queue'}</span>
              <span>{formatProgress(task.progress)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
