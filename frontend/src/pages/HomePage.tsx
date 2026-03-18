import { useState } from 'react'
import { LiveProcessingCard } from '../components/dashboard/LiveProcessingCard'
import { QuickActionGrid } from '../components/dashboard/QuickActionGrid'
import { QuickInputCard } from '../components/dashboard/QuickInputCard'
import { RecentExportsTable } from '../components/dashboard/RecentExportsTable'
import { useClipboard } from '../hooks/useClipboard'
import { QUICK_ACTIONS } from '../lib/constants'
import { useJobsStore } from '../store/jobsStore'

export function HomePage() {
  const [url, setUrl] = useState('')
  const { readText } = useClipboard()
  const { tasks, loading, error, startConvert, startDownload, startRemoveBackground, startSeparate } = useJobsStore((state) => ({
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    startDownload: state.startDownload,
    startConvert: state.startConvert,
    startRemoveBackground: state.startRemoveBackground,
    startSeparate: state.startSeparate,
  }))

  async function handleAnalyze() {
    await startDownload({
      url,
      format: 'mp4',
      quality: '1080p',
    })
    setUrl('')
  }

  async function handleFileSelect(file: File) {
    if (file.type.startsWith('image/')) {
      await startRemoveBackground(file)
      return
    }

    if (file.type.startsWith('audio/')) {
      await startSeparate(file, 'vocals')
      return
    }

    await startConvert(file, 'mp4')
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="space-y-6">
          <QuickActionGrid actions={QUICK_ACTIONS} />
          <QuickInputCard
            busy={loading}
            error={error}
            onAnalyze={() => void handleAnalyze()}
            onFileSelect={(file) => void handleFileSelect(file)}
            onPaste={async () => setUrl(await readText())}
            onUrlChange={setUrl}
            url={url}
          />
        </div>
        <LiveProcessingCard tasks={tasks} />
      </section>

      <RecentExportsTable tasks={tasks} />
    </div>
  )
}
