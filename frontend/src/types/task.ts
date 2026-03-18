import type { TaskStatus, TaskType } from '../lib/task-types'

export interface Task {
  id: string
  type: TaskType
  name: string
  status: TaskStatus
  progress: number
  stage?: string | null
  output_files: string[]
  error?: string | null
  size?: string | null
  created_at: string
  updated_at: string
}

export interface TasksResponse {
  tasks: Task[]
}

export interface TaskStartResponse {
  task_id: string
  type: TaskType
  status: 'started'
}
