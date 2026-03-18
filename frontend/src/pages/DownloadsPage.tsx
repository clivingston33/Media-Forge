import { useState } from 'react'
import { DownloadJobCard } from '../components/downloads/DownloadJobCard'
import { FormatPresetList } from '../components/downloads/FormatPresetList'
import { UrlInputCard } from '../components/downloads/UrlInputCard'
import { useClipboard } from '../hooks/useClipboard'
import { DOWNLOAD_PRESETS } from '../lib/constants'
import { useJobsStore } from '../store/jobsStore'

export function DownloadsPage() {
  const [url, setUrl] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(DOWNLOAD_PRESETS[0])
  const { readText } = useClipboard()
  const { tasks, loading, error, startDownload } = useJobsStore((state) => ({
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    startDownload: state.startDownload,
  }))

  const latestDownload = [...tasks]
    .filter((task) => task.type === 'download')
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))[0]

  async function handleSubmit() {
    await startDownload({
      url,
      format: selectedPreset.format,
      quality: selectedPreset.quality,
    })
    setUrl('')
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
      <div className="space-y-6">
        <UrlInputCard
          busy={loading}
          error={error}
          onChange={setUrl}
          onPaste={async () => setUrl(await readText())}
          onSubmit={() => void handleSubmit()}
          value={url}
        />
        <DownloadJobCard task={latestDownload} />
      </div>
      <FormatPresetList presets={DOWNLOAD_PRESETS} selected={selectedPreset} onSelect={setSelectedPreset} />
    </section>
  )
}
