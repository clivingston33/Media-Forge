import type { Task } from '../../types/task'
import { EmptyState } from '../shared/EmptyState'
import { QueueJobRow } from './QueueJobRow'

interface QueueListProps {
  tasks: Task[]
  onCancel?: (taskId: string) => void
}

export function QueueList({ tasks, onCancel }: QueueListProps) {
  if (tasks.length === 0) {
    return <EmptyState title="Queue is empty" description="Every queued, processing, and completed task will appear here." />
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <QueueJobRow key={task.id} onCancel={onCancel} task={task} />
      ))}
    </div>
  )
}
