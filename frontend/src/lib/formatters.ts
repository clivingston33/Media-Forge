import { STATUS_LABELS, TOOL_LABELS, type TaskStatus, type TaskType } from './task-types'

export function formatStatus(status: TaskStatus) {
  return STATUS_LABELS[status]
}

export function formatTool(type: TaskType) {
  return TOOL_LABELS[type]
}

export function formatProgress(progress: number) {
  return `${Math.max(0, Math.min(100, Math.round(progress)))}%`
}

export function formatRelativeTime(timestamp: string) {
  const then = new Date(timestamp).getTime()
  const deltaMinutes = Math.max(0, Math.round((Date.now() - then) / 60000))

  if (deltaMinutes < 1) {
    return 'Just now'
  }

  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`
  }

  const deltaHours = Math.round(deltaMinutes / 60)
  if (deltaHours < 24) {
    return `${deltaHours}h ago`
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function formatOutputCount(count: number) {
  return `${count} file${count === 1 ? '' : 's'}`
}
