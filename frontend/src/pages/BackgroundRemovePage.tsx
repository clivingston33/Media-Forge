import { useEffect, useState } from 'react'
import { PreviewPanel } from '../components/background/PreviewPanel'
import { RefinementPanel } from '../components/background/RefinementPanel'
import { DropZone } from '../components/shared/DropZone'
import { useJobsStore } from '../store/jobsStore'

export function BackgroundRemovePage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>()
  const { tasks, loading, error, startRemoveBackground } = useJobsStore((state) => ({
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    startRemoveBackground: state.startRemoveBackground,
  }))

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const latestTask = [...tasks]
    .filter((task) => task.type === 'remove_bg')
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))[0]

  return (
    <section className="grid gap-6 xl:grid-cols-[1.8fr,1fr]">
      <div className="space-y-6">
        <DropZone
          accept="image/*"
          description="Drop a still image to preview the original and queue a transparent output export."
          fileName={file?.name}
          onFileSelect={setFile}
          title="Add an image for background removal"
        />
        <div className="mf-panel p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Video Matte</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Subject extraction</h2>
          <div className="mt-6">
            <PreviewPanel originalUrl={previewUrl} processedUrl={latestTask?.status === 'done' ? previewUrl : undefined} />
          </div>
          {latestTask?.error ? <div className="mt-4 text-sm text-[#ffc2c2]">{latestTask.error}</div> : null}
        </div>
      </div>
      <RefinementPanel
        busy={loading}
        disabled={loading || !file}
        error={error}
        onSubmit={() => file && void startRemoveBackground(file)}
      />
    </section>
  )
}
