import { QueueList } from '../components/queue/QueueList'
import { useJobsStore } from '../store/jobsStore'

export function QueuePage() {
  const { tasks, error, cancelTask } = useJobsStore((state) => ({
    tasks: [...state.tasks].sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at)),
    error: state.error,
    cancelTask: state.cancelTask,
  }))

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
