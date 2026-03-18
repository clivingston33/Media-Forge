import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { getRouteByPath } from './routes'
import { AppLayout } from '../components/layout/AppLayout'
import { useDesktopRuntime } from '../hooks/useDesktopRuntime'
import { useSystemHealth } from '../hooks/useSystemHealth'
import { useTaskProgress } from '../hooks/useTaskProgress'
import { useSettingsStore } from '../store/settingsStore'
import { BackgroundRemovePage } from '../pages/BackgroundRemovePage'
import { ConvertPage } from '../pages/ConvertPage'
import { DownloadsPage } from '../pages/DownloadsPage'
import { HomePage } from '../pages/HomePage'
import { QueuePage } from '../pages/QueuePage'
import { SettingsPage } from '../pages/SettingsPage'
import { VoiceIsolatePage } from '../pages/VoiceIsolatePage'

export function AppShell() {
  const location = useLocation()
  const currentRoute = getRouteByPath(location.pathname)
  const hydrateSettings = useSettingsStore((state) => state.hydrate)

  useTaskProgress()
  useSystemHealth()
  useDesktopRuntime()

  useEffect(() => {
    void hydrateSettings()
  }, [hydrateSettings])

  return (
    <div className="mf-shell-grid min-h-screen bg-transparent text-[var(--mf-text)]">
      <AppLayout route={currentRoute}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/background-remove" element={<BackgroundRemovePage />} />
          <Route path="/voice-isolate" element={<VoiceIsolatePage />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
    </div>
  )
}
