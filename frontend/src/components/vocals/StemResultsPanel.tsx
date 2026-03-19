import { FolderSearch } from 'lucide-react'
import { useElectronDialog } from '../../hooks/useElectronDialog'
import { getFileName } from '../../lib/file-system'
import type { Task } from '../../types/task'
import { EmptyState } from '../shared/EmptyState'
import { FileCard } from '../shared/FileCard'

interface StemResultsPanelProps {
  task?: Task
}

export function StemResultsPanel({ task }: StemResultsPanelProps) {
  const { revealInFolder } = useElectronDialog()

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
            <FileCard
              key={output}
              aside={
                <button
                  className="mf-action-button inline-flex items-center gap-2 px-3 py-2 text-xs"
                  onClick={() => void revealInFolder(output)}
                  type="button"
                >
                  <FolderSearch className="h-3.5 w-3.5" />
                  Reveal
                </button>
              }
              caption="Ready for export or review"
              name={getFileName(output)}
            />
          ))
        )}
      </div>
      {task.error ? <div className="mt-4 text-sm text-[#ffc2c2]">{task.error}</div> : null}
    </div>
  )
}
