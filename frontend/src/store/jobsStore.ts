import { create } from 'zustand'
import { api } from '../lib/api'
import type { Task } from '../types/task'

interface JobsState {
  tasks: Task[]
  loading: boolean
  error: string | null
  activeTaskId: string | null
  refreshTasks: () => Promise<void>
  cancelTask: (taskId: string) => Promise<void>
  startDownload: (payload: {
    url: string
    format: 'mp4' | 'mp3' | 'webm'
    quality: 'best' | '1080p' | '720p' | '480p' | 'audio_only'
  }) => Promise<void>
  startConvert: (file: File, outputFormat: 'mp3' | 'wav' | 'mp4' | 'mov' | 'gif' | 'flac' | 'aac' | 'webm') => Promise<void>
  startSeparate: (file: File, mode: 'vocals' | 'all_stems') => Promise<void>
  startRemoveBackground: (file: File) => Promise<void>
}

async function refreshAndTrack(set: (partial: Partial<JobsState>) => void) {
  const tasks = await api.listTasks()
  set({
    tasks,
    loading: false,
    activeTaskId: tasks.find((task) => task.status === 'processing' || task.status === 'queued')?.id ?? null,
  })
}

export const useJobsStore = create<JobsState>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  activeTaskId: null,
  refreshTasks: async () => {
    set({ loading: true, error: null })

    try {
      await refreshAndTrack(set)
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load MediaForge tasks.',
      })
    }
  },
  cancelTask: async (taskId) => {
    set({ error: null })

    try {
      await api.cancelTask(taskId)
      await refreshAndTrack(set)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to cancel task.',
      })
    }
  },
  startDownload: async (payload) => {
    set({ loading: true, error: null })

    try {
      const response = await api.startDownload(payload)
      set({ activeTaskId: response.task_id })
      await refreshAndTrack(set)
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to start download.',
      })
    }
  },
  startConvert: async (file, outputFormat) => {
    set({ loading: true, error: null })

    try {
      const response = await api.startConvert(file, outputFormat)
      set({ activeTaskId: response.task_id })
      await refreshAndTrack(set)
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to start conversion.',
      })
    }
  },
  startSeparate: async (file, mode) => {
    set({ loading: true, error: null })

    try {
      const response = await api.startSeparate(file, mode)
      set({ activeTaskId: response.task_id })
      await refreshAndTrack(set)
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to start voice isolation.',
      })
    }
  },
  startRemoveBackground: async (file) => {
    set({ loading: true, error: null })

    try {
      const response = await api.startRemoveBackground(file)
      set({ activeTaskId: response.task_id })
      await refreshAndTrack(set)
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to remove the background.',
      })
    }
  },
}))
