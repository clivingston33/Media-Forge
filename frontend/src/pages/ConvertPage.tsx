import { useState } from 'react'
import { ConvertJobCard } from '../components/convert/ConvertJobCard'
import { FormatCard } from '../components/convert/FormatCard'
import { TargetPresetList } from '../components/convert/TargetPresetList'
import { DropZone } from '../components/shared/DropZone'
import { CONVERT_TARGETS } from '../lib/constants'
import { useJobsStore } from '../store/jobsStore'

export function ConvertPage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedPreset, setSelectedPreset] = useState(CONVERT_TARGETS[0])
  const { tasks, loading, error, startConvert } = useJobsStore((state) => ({
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    startConvert: state.startConvert,
  }))

  const latestTask = [...tasks]
    .filter((task) => task.type === 'convert')
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))[0]

  const inputExtension = file?.name.split('.').pop()?.toUpperCase() ?? 'No file selected'

  return (
    <section className="grid gap-6 xl:grid-cols-[1.8fr,1fr]">
      <div className="space-y-6">
        <DropZone
          description="Load video or audio into the convert workspace and queue a format target."
          fileName={file?.name}
          onFileSelect={setFile}
          title="Drop media for conversion"
        />
        <div className="mf-panel p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Transcoding</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Convert media</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FormatCard label="Input" value={inputExtension} />
            <FormatCard label="Output" value={`${selectedPreset.format.toUpperCase()} - ${selectedPreset.label}`} />
          </div>
          <button
            className="mf-primary-button mt-6 w-full"
            disabled={loading || !file}
            onClick={() => file && void startConvert(file, selectedPreset.format)}
            type="button"
          >
            {loading ? 'Queuing...' : 'Convert File'}
          </button>
          {error ? <div className="mt-4 text-sm text-[#ffc2c2]">{error}</div> : null}
        </div>
        <ConvertJobCard task={latestTask} />
      </div>
      <TargetPresetList presets={CONVERT_TARGETS} selected={selectedPreset} onSelect={setSelectedPreset} />
    </section>
  )
}
