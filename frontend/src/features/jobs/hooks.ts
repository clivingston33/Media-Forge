import { useShallow } from 'zustand/react/shallow'
import type { TaskType } from '../../lib/task-types'
import { useJobsStore } from '../../store/jobsStore'
import { countActiveTasks, findLatestTask, sortTasksByUpdatedAt } from './selectors'

export function useJobsOverview() {
  return useJobsStore(
    useShallow((state) => ({
      tasks: state.tasks,
      loading: state.loading,
      error: state.error,
    })),
  )
}

export function useJobActions() {
  return useJobsStore(
    useShallow((state) => ({
      cancelTask: state.cancelTask,
      startDownload: state.startDownload,
      startConvert: state.startConvert,
      startSeparate: state.startSeparate,
      startRemoveBackground: state.startRemoveBackground,
    })),
  )
}

export function useLatestTask(taskType: TaskType) {
  return useJobsStore((state) => findLatestTask(state.tasks, taskType))
}

export function useSortedTasks() {
  return useJobsStore(useShallow((state) => sortTasksByUpdatedAt(state.tasks)))
}

export function useActiveTaskCount() {
  return useJobsStore((state) => countActiveTasks(state.tasks))
}
