import type { SystemHealth } from '../types/health'
import type { AppSettings } from '../types/settings'
import type { Task, TaskStartResponse, TasksResponse } from '../types/task'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

function formatDetail(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>
          const location = Array.isArray(record.loc) ? record.loc.join('.') : null
          const message = typeof record.msg === 'string' ? record.msg : null
          return [location, message].filter(Boolean).join(': ')
        }

        return null
      })
      .filter((item): item is string => Boolean(item))

    return messages.length > 0 ? messages.join('; ') : null
  }

  return null
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    let message: string | null = null

    if (contentType.includes('application/json')) {
      try {
        const payload = (await response.json()) as { detail?: unknown }
        message = formatDetail(payload.detail)
      } catch {
        message = null
      }
    }

    if (!message) {
      const fallback = await response.text()
      message = fallback || null
    }

    throw new Error(message || `Request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  health: (refresh = false) => requestJson<SystemHealth>(`/api/health${refresh ? '?refresh=true' : ''}`),
  listTasks: async (): Promise<Task[]> => {
    const payload = await requestJson<TasksResponse>('/api/tasks')
    return payload.tasks
  },
  getTask: (taskId: string) => requestJson<Task>(`/api/tasks/${taskId}`),
  cancelTask: (taskId: string) =>
    requestJson<Task>(`/api/tasks/${taskId}/cancel`, {
      method: 'POST',
    }),
  getSettings: () => requestJson<AppSettings>('/api/settings'),
  updateSettings: (settings: Partial<AppSettings>) =>
    requestJson<AppSettings>('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }),
  startDownload: (payload: {
    url: string
    format: 'mp4' | 'mp3' | 'webm'
    quality: 'best' | '1080p' | '720p' | '480p' | 'audio_only'
  }) =>
    requestJson<TaskStartResponse>('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  startConvert: (file: File, outputFormat: 'mp3' | 'wav' | 'mp4' | 'mov' | 'gif' | 'flac' | 'aac' | 'webm') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('output_format', outputFormat)

    return requestJson<TaskStartResponse>('/api/convert', {
      method: 'POST',
      body: formData,
    })
  },
  startSeparate: (file: File, mode: 'vocals' | 'all_stems') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    return requestJson<TaskStartResponse>('/api/separate', {
      method: 'POST',
      body: formData,
    })
  },
  startRemoveBackground: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return requestJson<TaskStartResponse>('/api/remove-bg', {
      method: 'POST',
      body: formData,
    })
  },
}

export { API_BASE_URL }
