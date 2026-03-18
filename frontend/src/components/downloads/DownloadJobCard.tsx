import { formatProgress } from '../../lib/formatters'
import type { Task } from '../../types/task'
import { EmptyState } from '../shared/EmptyState'
import { ProgressBar } from '../shared/ProgressBar'
import { StatusPill } from '../shared/StatusPill'

interface DownloadJobCardProps {
  task?: Task
}

export function DownloadJobCard({ task }: DownloadJobCardProps) {
  if (!task) {
    return <EmptyState title="No download jobs yet" description="Start from a URL and your latest export will show up here." />
  }

  return (
    <div className="mf-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Latest Download</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{task.name}</h2>
        </div>
        <StatusPill status={task.status} />
      </div>
      <div className="mt-6">
        <ProgressBar value={task.progress} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-white/55">
        <span>{task.stage || 'Waiting to start'}</span>
        <span>{formatProgress(task.progress)}</span>
      </div>
      {task.error ? <div className="mt-4 text-sm text-[#ffc2c2]">{task.error}</div> : null}
    </div>
  )
}
