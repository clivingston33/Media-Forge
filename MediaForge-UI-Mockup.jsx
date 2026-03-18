import { useState } from 'react';

export default function MediaToolboxMockup() {
  const [activeTab, setActiveTab] = useState('Home');

  const navItems = [
    { label: 'Home' },
    { label: 'Downloads' },
    { label: 'Background Remove' },
    { label: 'Voice Isolate' },
    { label: 'Convert' },
    { label: 'Queue' },
    { label: 'Settings' },
  ];

  const recentFiles = [
    {
      name: 'interview_clip.mp4',
      tag: 'Voice Isolate',
      status: 'Ready',
      size: '84 MB',
    },
    {
      name: 'music_video.mov',
      tag: 'Background Remove',
      status: 'Processing',
      size: '312 MB',
    },
    {
      name: 'podcast_audio.wav',
      tag: 'Convert',
      status: 'Done',
      size: '126 MB',
    },
  ];

  const tools = [
    {
      title: 'Download Video',
      desc: 'Paste a link and export clean MP4 or MP3 files.',
      target: 'Downloads',
    },
    {
      title: 'Remove Background',
      desc: 'Separate subject from background for clips and frames.',
      target: 'Background Remove',
    },
    {
      title: 'Isolate Voice',
      desc: 'Extract vocals, dialogue, or speech with one click.',
      target: 'Voice Isolate',
    },
    {
      title: 'Convert Files',
      desc: 'Transcode media into edit-ready formats and presets.',
      target: 'Convert',
    },
  ];

  const pageMeta: Record<string, { title: string; description: string }> = {
    Home: {
      title: 'Media workspace',
      description: 'Download, clean, convert, and extract media in one local workflow.',
    },
    Downloads: {
      title: 'Downloads',
      description: 'Paste links, inspect formats, and export clean local files.',
    },
    'Background Remove': {
      title: 'Background Remove',
      description: 'Separate subjects from backgrounds for video clips and frames.',
    },
    'Voice Isolate': {
      title: 'Voice Isolate',
      description: 'Extract vocals, dialogue, and speech with AI-powered separation.',
    },
    Convert: {
      title: 'Convert Files',
      description: 'Transcode media into edit-ready formats, codecs, and presets.',
    },
    Queue: {
      title: 'Processing Queue',
      description: 'Track live jobs, progress, and completed exports in one place.',
    },
    Settings: {
      title: 'Settings',
      description: 'Manage performance, export defaults, and processing preferences.',
    },
  };

  function renderHome() {
    return (
      <>
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/35">Quick Action</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create a new job</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50">
                Local processing
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {tools.map((tool) => (
                <button
                  key={tool.title}
                  onClick={() => setActiveTab(tool.target)}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <div className="h-3.5 w-3.5 rounded-full bg-white/80" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium tracking-tight">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{tool.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="mb-3 text-sm font-medium text-white/75">Paste URL or choose a file</div>
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/35">
                  https://youtube.com/watch?v=...
                </div>
                <button className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black">
                  Analyze
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">Queue</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Live processing</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">music_video.mov</span>
                  <span className="text-xs text-white/40">62%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[62%] rounded-full bg-white" />
                </div>
                <div className="mt-3 text-xs text-white/40">Background separation in progress</div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">podcast_audio.wav</span>
                  <span className="text-xs text-white/40">Queued</span>
                </div>
                <div className="mt-3 text-xs text-white/40">Voice isolation preset: Speech Focus</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/35">Recent Files</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Last exports</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/45">
              Today
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
            <div className="grid grid-cols-12 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/35">
              <div className="col-span-5">File</div>
              <div className="col-span-3">Tool</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Size</div>
            </div>

            {recentFiles.map((file) => (
              <div
                key={file.name}
                className="grid grid-cols-12 items-center border-b border-white/10 px-4 py-4 text-sm last:border-b-0"
              >
                <div className="col-span-5 font-medium tracking-tight text-white/90">{file.name}</div>
                <div className="col-span-3 text-white/55">{file.tag}</div>
                <div className="col-span-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/65">
                    {file.status}
                  </span>
                </div>
                <div className="col-span-2 text-white/45">{file.size}</div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderDownloads() {
    return (
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Input</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Link import</h2>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="mb-3 text-sm font-medium text-white/75">YouTube URL</div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/35">
                https://youtube.com/watch?v=...
              </div>
              <button className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black">Fetch</button>
            </div>
          </div>
        </div>
        <div className="col-span-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Export</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Format preset</h2>
          <div className="mt-6 space-y-3">
            {['MP4 1080p', 'MP3 320kbps', 'WAV Audio'].map((preset) => (
              <button
                key={preset}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/75 transition hover:bg-white/[0.04]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderBackgroundRemove() {
    return (
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Video Matte</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Subject extraction</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-10 text-center text-sm text-white/35">
              Original Preview
            </div>
            <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-10 text-center text-sm text-white/35">
              Transparent Output
            </div>
          </div>
        </div>
        <div className="col-span-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Controls</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Refinement</h2>
          <div className="mt-6 space-y-3 text-sm text-white/65">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Edge smoothing</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Shadow cleanup</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Background color</div>
          </div>
        </div>
      </section>
    );
  }

  function renderVoiceIsolate() {
    return (
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Audio Separation</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Speech and vocal isolation</h2>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="mb-4 text-sm text-white/65">Waveform preview</div>
            <div className="h-40 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]" />
          </div>
        </div>
        <div className="col-span-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Modes</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Presets</h2>
          <div className="mt-6 space-y-3">
            {['Speech Focus', 'Vocal Only', 'Music Minus Voice'].map((preset) => (
              <button
                key={preset}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/75 transition hover:bg-white/[0.04]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderConvert() {
    return (
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Transcoding</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Convert media</h2>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
            <div className="grid grid-cols-2 gap-4 text-sm text-white/65">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Input: MOV</div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Output: MP4 H.264</div>
            </div>
          </div>
        </div>
        <div className="col-span-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Presets</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Targets</h2>
          <div className="mt-6 space-y-3">
            {['Premiere Ready', 'After Effects Proxy', 'Audio WAV'].map((preset) => (
              <button
                key={preset}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/75 transition hover:bg-white/[0.04]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderQueue() {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-white/35">Jobs</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Processing queue</h2>
        <div className="mt-6 space-y-4">
          {[
            ['music_video.mov', 'Background Remove', '62%'],
            ['podcast_audio.wav', 'Voice Isolate', 'Queued'],
            ['clip_export.mp4', 'Convert', 'Done'],
          ].map(([name, type, state]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/20 px-5 py-4"
            >
              <div>
                <div className="text-sm font-medium text-white/85">{name}</div>
                <div className="mt-1 text-xs text-white/40">{type}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">{state}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderSettings() {
    return (
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-7 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Application</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">General settings</h2>
          <div className="mt-6 space-y-3">
            {['GPU acceleration', 'Auto-save exports', 'Default output folder'].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/75"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Performance</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Resources</h2>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-white/60">
            GPU: Enabled
            <br />
            Queue concurrency: 2
            <br />
            Temp cache: 12.4 GB
          </div>
        </div>
      </section>
    );
  }

  function renderMainContent() {
    switch (activeTab) {
      case 'Downloads':
        return renderDownloads();
      case 'Background Remove':
        return renderBackgroundRemove();
      case 'Voice Isolate':
        return renderVoiceIsolate();
      case 'Convert':
        return renderConvert();
      case 'Queue':
        return renderQueue();
      case 'Settings':
        return renderSettings();
      case 'Home':
      default:
        return renderHome();
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white antialiased">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-white/10 bg-white/[0.02] px-5 py-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="h-4 w-4 rounded-full border border-white/70" />
            </div>
            <div>
              <div className="text-sm text-white/45">Desktop Suite</div>
              <div className="text-lg font-semibold tracking-tight">Sentinel Media</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                  activeTab === item.label
                    ? 'bg-white text-black shadow-lg'
                    : 'text-white/65 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">System</div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 text-sm text-white/55">GPU Acceleration</div>
                <div className="text-sm font-medium">Enabled</div>
              </div>
              <div>
                <div className="mb-1 text-sm text-white/55">Queue</div>
                <div className="text-sm font-medium">3 active tasks</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">{pageMeta[activeTab].title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  {pageMeta[activeTab].description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80">
                  Import File
                </button>
                <button className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black shadow-xl">
                  New Task
                </button>
              </div>
            </div>

            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
