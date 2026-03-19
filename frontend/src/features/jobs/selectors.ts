import type { TaskType } from '../../lib/task-types'
import type { Task } from '../../types/task'

function getUpdatedTimestamp(task: Task) {
  return Date.parse(task.updated_at)
}

export function sortTasksByUpdatedAt(tasks: Task[]) {
  return [...tasks].sort((left, right) => getUpdatedTimestamp(right) - getUpdatedTimestamp(left))
}

export function findLatestTask(tasks: Task[], taskType: TaskType) {
  let latestTask: Task | undefined

  for (const task of tasks) {
    if (task.type !== taskType) {
      continue
    }

    if (!latestTask || getUpdatedTimestamp(task) > getUpdatedTimestamp(latestTask)) {
      latestTask = task
    }
  }

  return latestTask
}

export function countActiveTasks(tasks: Task[]) {
  return tasks.filter((task) => task.status === 'queued' || task.status === 'processing').length
}
