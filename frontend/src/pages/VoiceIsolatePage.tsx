import { useState } from 'react'
import { PresetList } from '../components/vocals/PresetList'
import { StemResultsPanel } from '../components/vocals/StemResultsPanel'
import { WaveformPanel } from '../components/vocals/WaveformPanel'
import { DropZone } from '../components/shared/DropZone'
import { VOICE_PRESETS } from '../lib/constants'
import { useJobsStore } from '../store/jobsStore'

export function VoiceIsolatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [selectedPreset, setSelectedPreset] = useState(VOICE_PRESETS[0])
  const { tasks, loading, error, startSeparate } = useJobsStore((state) => ({
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    startSeparate: state.startSeparate,
  }))

  const latestTask = [...tasks]
    .filter((task) => task.type === 'separate')
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))[0]

  return (
    <section className="grid gap-6 xl:grid-cols-[1.8fr,1fr]">
      <div className="space-y-6">
        <DropZone
          accept="audio/*"
          description="Load a local audio file to preview the waveform and queue vocal or stem extraction."
          fileName={file?.name}
          onFileSelect={setFile}
          title="Drop an audio file"
        />
        <WaveformPanel fileName={file?.name} />
        <button className="mf-primary-button w-full" disabled={loading || !file} onClick={() => file && void startSeparate(file, selectedPreset.mode)}>
          {loading ? 'Queuing...' : 'Isolate Voice'}
        </button>
        {error ? <div className="text-sm text-[#ffc2c2]">{error}</div> : null}
      </div>
      <div className="space-y-6">
        <PresetList presets={VOICE_PRESETS} selected={selectedPreset} onSelect={setSelectedPreset} />
        <StemResultsPanel task={latestTask} />
      </div>
    </section>
  )
}
