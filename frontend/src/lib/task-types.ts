export const TASK_TYPES = ['download', 'convert', 'separate', 'remove_bg'] as const
export const TASK_STATUSES = ['queued', 'processing', 'done', 'error', 'cancelled'] as const

export type TaskType = (typeof TASK_TYPES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TOOL_LABELS: Record<TaskType, string> = {
  download: 'Downloads',
  convert: 'Convert',
  separate: 'Voice Isolate',
  remove_bg: 'Background Remove',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  queued: 'Queued',
  processing: 'Processing',
  done: 'Done',
  error: 'Error',
  cancelled: 'Cancelled',
}
