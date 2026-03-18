import { formatRelativeTime, formatTool } from '../../lib/formatters'
import type { Task } from '../../types/task'
import { EmptyState } from '../shared/EmptyState'
import { SectionHeader } from '../shared/SectionHeader'
import { StatusPill } from '../shared/StatusPill'

interface RecentExportsTableProps {
  tasks: Task[]
}

export function RecentExportsTable({ tasks }: RecentExportsTableProps) {
  const recentTasks = [...tasks]
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))
    .slice(0, 5)

  return (
    <div className="mf-panel p-6">
      <SectionHeader
        eyebrow="Recent Files"
        title="Last exports"
        aside={<div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/45">Today</div>}
      />

      <div className="mt-6">
        {recentTasks.length === 0 ? (
          <EmptyState title="No exports yet" description="Completed jobs will land here with their latest status and output details." />
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/35">
              <div className="col-span-5">File</div>
              <div className="col-span-3">Tool</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Updated</div>
            </div>

            {recentTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 items-center border-b border-white/10 px-4 py-4 text-sm last:border-b-0">
                <div className="col-span-5 font-medium tracking-tight text-white/90">{task.name}</div>
                <div className="col-span-3 text-white/55">{formatTool(task.type)}</div>
                <div className="col-span-2">
                  <StatusPill status={task.status} />
                </div>
                <div className="col-span-2 text-white/45">{formatRelativeTime(task.updated_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
