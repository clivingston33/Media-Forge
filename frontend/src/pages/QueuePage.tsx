import { QueueList } from '../components/queue/QueueList'
import { useJobActions, useJobsOverview, useSortedTasks } from '../features/jobs/hooks'

export function QueuePage() {
  const tasks = useSortedTasks()
  const { error } = useJobsOverview()
  const { cancelTask } = useJobActions()

  return (
    <section className="mf-panel p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/35">Jobs</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Processing queue</h2>
      {error ? <div className="mt-4 text-sm text-[#ffc2c2]">{error}</div> : null}
      <div className="mt-6">
        <QueueList onCancel={(taskId) => void cancelTask(taskId)} tasks={tasks} />
      </div>
    </section>
  )
}
