import { useEffect } from 'react'
import { useJobsStore } from '../store/jobsStore'

export function useTaskProgress(pollIntervalMs = 2000) {
  const refreshTasks = useJobsStore((state) => state.refreshTasks)

  useEffect(() => {
    void refreshTasks()

    const intervalId = window.setInterval(() => {
      void refreshTasks()
    }, pollIntervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [pollIntervalMs, refreshTasks])
}
