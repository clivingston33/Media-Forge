import { useState } from 'react'
import { DownloadJobCard } from '../components/downloads/DownloadJobCard'
import { FormatPresetList } from '../components/downloads/FormatPresetList'
import { UrlInputCard } from '../components/downloads/UrlInputCard'
import { useJobActions, useJobsOverview, useLatestTask } from '../features/jobs/hooks'
import { useClipboard } from '../hooks/useClipboard'
import { DOWNLOAD_PRESETS } from '../lib/constants'

export function DownloadsPage() {
  const [url, setUrl] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(DOWNLOAD_PRESETS[0])
  const { readText } = useClipboard()
  const { loading, error } = useJobsOverview()
  const { startDownload } = useJobActions()
  const latestDownload = useLatestTask('download')

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
