import type { Task } from '../../types/task'
import { EmptyState } from '../shared/EmptyState'
import { FileCard } from '../shared/FileCard'

interface StemResultsPanelProps {
  task?: Task
}

export function StemResultsPanel({ task }: StemResultsPanelProps) {
  if (!task) {
    return <EmptyState title="No stem exports yet" description="Run voice isolation to preview the latest extracted vocal or stem outputs." />
  }

  return (
    <div className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Outputs</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Stem results</h2>
      <div className="mt-6 space-y-3">
        {task.output_files.length === 0 ? (
          <FileCard name={task.name} caption={task.stage || 'Processing output files'} />
        ) : (
          task.output_files.map((output) => (
            <FileCard key={output} name={output.split('/').pop() ?? output} caption="Ready for export or review" />
          ))
        )}
      </div>
      {task.error ? <div className="mt-4 text-sm text-[#ffc2c2]">{task.error}</div> : null}
    </div>
  )
}
