import { X } from 'lucide-react'
import { formatOutputCount, formatRelativeTime, formatTool } from '../../lib/formatters'
import type { Task } from '../../types/task'
import { ProgressBar } from '../shared/ProgressBar'
import { StatusPill } from '../shared/StatusPill'

interface QueueJobRowProps {
  task: Task
  onCancel?: (taskId: string) => void
}

export function QueueJobRow({ task, onCancel }: QueueJobRowProps) {
  const cancellable = task.status === 'queued' || task.status === 'processing'

  return (
    <div className="mf-subpanel px-5 py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium text-white/85">{task.name}</div>
          <div className="mt-1 text-xs text-white/40">
            {formatTool(task.type)} - {formatRelativeTime(task.updated_at)} - {formatOutputCount(task.output_files.length)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cancellable ? (
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition hover:bg-white/[0.06] hover:text-white"
              onClick={() => onCancel?.(task.id)}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          ) : null}
          <div className="w-40">
            <ProgressBar value={task.progress} />
          </div>
          <StatusPill status={task.status} />
        </div>
      </div>
      <div className="mt-3 text-xs text-white/45">{task.error || task.stage || 'Waiting in queue'}</div>
    </div>
  )
}
