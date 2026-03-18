import { useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useSystemHealthStore } from '../store/systemHealthStore'

export function useSystemHealth(pollIntervalMs = 15000) {
  const refresh = useSystemHealthStore((state) => state.refresh)
  const outputFolder = useSettingsStore((state) => state.output_folder)
  const gpuAcceleration = useSettingsStore((state) => state.gpu_acceleration)

  useEffect(() => {
    void refresh()

    const intervalId = window.setInterval(() => {
      void refresh()
    }, pollIntervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [pollIntervalMs, refresh])

  useEffect(() => {
    void refresh(true)
  }, [gpuAcceleration, outputFolder, refresh])
}
