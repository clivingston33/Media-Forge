# MediaForge — Project Scaffold

> Personal media toolkit: download, convert, isolate vocals, remove backgrounds. All local, all free.

---

## Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React + TypeScript + Tailwind | Matches the mockup and keeps the UI fast to build |
| Desktop | Electron | Wraps the app and gives local file system access |
| Backend | FastAPI (Python) | Best fit for media tooling and Python-native ML libraries |
| Download | yt-dlp | Standard for media extraction |
| Conversion | FFmpeg | Universal media conversion engine |
| Vocals | Demucs | Strong open source stem separation |
| BG Remove | rembg | Fast local background removal |
| State | Zustand or React state | Simple UI state for tabs, jobs, and settings |
| Realtime | WebSockets | Queue progress and live task updates |

---

## UI Structure to Match the Mockup

The mockup is not a 4-tab utility anymore. It is a **dashboard-first desktop app** with these screens:

1. **Home**
   - Header with app title and actions
   - Quick action cards
   - Paste URL / choose file input
   - Live processing panel
   - Recent exports table

2. **Downloads**
   - URL input
   - Format preset picker
   - Download action
   - Download job status

3. **Background Remove**
   - Original preview
   - Transparent output preview
   - Refinement controls

4. **Voice Isolate**
   - Audio upload
   - Waveform preview
   - Preset modes

5. **Convert**
   - Input/output format cards
   - Preset targets
   - Conversion action

6. **Queue**
   - All active and completed jobs
   - Status pills and progress

7. **Settings**
   - GPU acceleration
   - Default output folder
   - Queue concurrency
   - Temp cache and performance options

That means the scaffold should reflect a **layout-driven app**, not just separate feature pages.

---

## Updated Folder Structure

```txt
mediaforge/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── AppShell.tsx                 # Main desktop layout wrapper
│   │   │   ├── routes.tsx                   # Route or tab config
│   │   │   └── providers.tsx                # App-level providers
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx              # Left nav matching mockup
│   │   │   │   ├── Topbar.tsx               # Header with page title + actions
│   │   │   │   ├── AppLayout.tsx            # Sidebar + content frame
│   │   │   │   └── SystemCard.tsx           # GPU / queue status card
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── QuickActionGrid.tsx      # 4 feature cards on Home
│   │   │   │   ├── QuickInputCard.tsx       # Paste URL / choose file
│   │   │   │   ├── LiveProcessingCard.tsx   # Right-side processing widget
│   │   │   │   └── RecentExportsTable.tsx   # Recent files table
│   │   │   │
│   │   │   ├── downloads/
│   │   │   │   ├── DownloadPage.tsx         # Full Downloads screen
│   │   │   │   ├── UrlInputCard.tsx         # URL field + paste/fetch
│   │   │   │   ├── FormatPresetList.tsx     # MP4/MP3/WAV preset list
│   │   │   │   └── DownloadJobCard.tsx      # Download status card
│   │   │   │
│   │   │   ├── background/
│   │   │   │   ├── BackgroundPage.tsx       # Full BG remove screen
│   │   │   │   ├── PreviewPanel.tsx         # Original/output preview panels
│   │   │   │   ├── RefinementPanel.tsx      # Edge smoothing etc.
│   │   │   │   └── BeforeAfterSlider.tsx    # Later polish component
│   │   │   │
│   │   │   ├── vocals/
│   │   │   │   ├── VoicePage.tsx            # Full voice isolate screen
│   │   │   │   ├── WaveformPanel.tsx        # Waveform area
│   │   │   │   ├── PresetList.tsx           # Speech Focus / Vocal Only / etc.
│   │   │   │   └── StemResultsPanel.tsx     # Output stem download/play area
│   │   │   │
│   │   │   ├── convert/
│   │   │   │   ├── ConvertPage.tsx          # Full convert screen
│   │   │   │   ├── FormatCard.tsx           # Input/output format summary cards
│   │   │   │   ├── TargetPresetList.tsx     # Premiere / AE / WAV presets
│   │   │   │   └── ConvertJobCard.tsx       # Conversion status/result
│   │   │   │
│   │   │   ├── queue/
│   │   │   │   ├── QueuePage.tsx            # Unified queue screen
│   │   │   │   ├── QueueList.tsx            # All jobs list
│   │   │   │   └── QueueJobRow.tsx          # Single queue row/card
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── SettingsPage.tsx         # Settings screen
│   │   │   │   ├── GeneralSettingsCard.tsx  # General toggles / folder picker
│   │   │   │   └── ResourceCard.tsx         # GPU, concurrency, cache info
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── DropZone.tsx             # Reusable upload area
│   │   │       ├── ProgressBar.tsx          # Reusable progress component
│   │   │       ├── StatusPill.tsx           # Ready / Processing / Done
│   │   │       ├── SectionHeader.tsx        # Reusable section labels
│   │   │       ├── FileCard.tsx             # File info + actions
│   │   │       └── EmptyState.tsx           # Empty screen placeholder
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── DownloadsPage.tsx
│   │   │   ├── BackgroundRemovePage.tsx
│   │   │   ├── VoiceIsolatePage.tsx
│   │   │   ├── ConvertPage.tsx
│   │   │   ├── QueuePage.tsx
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   ├── store/
│   │   │   ├── uiStore.ts                   # Active tab, theme, sidebar state
│   │   │   ├── jobsStore.ts                 # Task queue, progress, history
│   │   │   └── settingsStore.ts             # Output folder, performance options
│   │   │
│   │   ├── hooks/
│   │   │   ├── useApi.ts                    # Fetch wrapper
│   │   │   ├── useTaskProgress.ts           # WebSocket task progress
│   │   │   ├── useElectronDialog.ts         # Open folder/file dialogs
│   │   │   └── useClipboard.ts              # Paste URL helper
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                       # Endpoint definitions
│   │   │   ├── constants.ts                 # Nav items, presets, labels
│   │   │   ├── formatters.ts                # File size, status text
│   │   │   └── task-types.ts                # Shared task enums/types
│   │   │
│   │   ├── types/
│   │   │   ├── task.ts
│   │   │   ├── settings.ts
│   │   │   └── media.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── electron/
│   │   ├── main.ts                          # Electron main process
│   │   ├── preload.ts                       # Secure bridge
│   │   └── ipc/
│   │       ├── dialogs.ts                   # Folder/file picker IPC
│   │       └── shell.ts                     # Open file/folder in OS
│   │
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI init
│   │   ├── routers/
│   │   │   ├── health.py                    # GET /api/health
│   │   │   ├── download.py                  # POST /api/download
│   │   │   ├── convert.py                   # POST /api/convert
│   │   │   ├── vocals.py                    # POST /api/separate
│   │   │   ├── background.py                # POST /api/remove-bg
│   │   │   ├── tasks.py                     # GET /api/tasks, GET /api/tasks/{id}
│   │   │   └── settings.py                  # Optional persisted settings endpoints
│   │   │
│   │   ├── services/
│   │   │   ├── ytdlp_service.py
│   │   │   ├── ffmpeg_service.py
│   │   │   ├── demucs_service.py
│   │   │   ├── rembg_service.py
│   │   │   └── task_manager.py              # Unified task registry/progress state
│   │   │
│   │   ├── models/
│   │   │   ├── schemas.py                   # Pydantic request/response
│   │   │   └── task.py                      # Unified task schema
│   │   │
│   │   └── utils/
│   │       ├── file_utils.py
│   │       ├── progress.py                  # WS push helpers
│   │       └── paths.py                     # Output directory management
│   │
│   ├── requirements.txt
│   └── start.py
│
├── scripts/
│   ├── install.sh
│   ├── dev.sh
│   └── build.sh
│
└── README.md
```

---

## Why This Structure Fits the Mockup Better

Your original scaffold was **feature-first only**. The mockup is **dashboard + workspace-first**.

Key fixes:
- added a real **Home page**
- added **Queue** and **Settings** as first-class pages
- split layout components from feature components
- added a shared **jobs store** because the UI shows one unified processing system
- added a **task manager** backend so all tools report progress consistently
- organized feature pages around the actual screen sections visible in the mockup

---

## Navigation Model

```ts
const NAV_ITEMS = [
  { label: 'Home', route: '/' },
  { label: 'Downloads', route: '/downloads' },
  { label: 'Background Remove', route: '/background-remove' },
  { label: 'Voice Isolate', route: '/voice-isolate' },
  { label: 'Convert', route: '/convert' },
  { label: 'Queue', route: '/queue' },
  { label: 'Settings', route: '/settings' },
];
```

This matches the sidebar from the mockup exactly.

---

## Updated API Shape

The original endpoints are fine, but the mockup benefits from a more unified task model.

### Health
```http
GET /api/health
Response: { status: "ok" }
```

### Download
```http
POST /api/download
Body: {
  url: string,
  format: "mp4" | "mp3" | "webm",
  quality: "best" | "1080p" | "720p" | "480p" | "audio_only"
}
Response: {
  task_id: string,
  type: "download",
  status: "started"
}
```

### Convert
```http
POST /api/convert
Body: FormData {
  file: File,
  output_format: "mp3" | "wav" | "mp4" | "mov" | "gif" | "flac" | "aac" | "webm"
}
Response: {
  task_id: string,
  type: "convert",
  status: "started"
}
```

### Separate Vocals
```http
POST /api/separate
Body: FormData {
  file: File,
  mode: "vocals" | "all_stems"
}
Response: {
  task_id: string,
  type: "separate",
  status: "started"
}
```

### Remove Background
```http
POST /api/remove-bg
Body: FormData {
  file: File
}
Response: {
  task_id: string,
  type: "remove_bg",
  status: "started"
}
```

### Unified Task Endpoints
```http
GET /api/tasks
Response: {
  tasks: Array<{
    id: string,
    type: "download" | "convert" | "separate" | "remove_bg",
    name: string,
    status: "queued" | "processing" | "done" | "error",
    progress: number,
    stage?: string,
    output_files?: string[]
  }>
}
```

```http
GET /api/tasks/{task_id}
Response: {
  id: string,
  type: string,
  name: string,
  status: string,
  progress: number,
  stage?: string,
  output_files?: string[],
  error?: string
}
```

### WebSocket
```http
WS /ws/progress/{task_id}
Messages: {
  task_id: string,
  progress: number,
  stage: string,
  status: "queued" | "processing" | "done" | "error",
  eta_seconds?: number
}
```

This gives you:
- per-page progress
- Home live processing panel
- Queue page
- recent exports/history hooks

---

## Frontend Page Responsibilities

### HomePage
Contains:
- quick action cards
- quick URL/file input
- live processing widget
- recent exports table

### DownloadsPage
Contains:
- URL input
- format/quality selection
- fetch/download action
- latest download jobs

### BackgroundRemovePage
Contains:
- image upload
- original preview
- transparent output preview
- refinement controls
- export button

### VoiceIsolatePage
Contains:
- audio upload
- preset selection
- waveform preview
- stem results

### ConvertPage
Contains:
- file input
- output format selection
- conversion presets
- result/download card

### QueuePage
Contains:
- all active/completed tasks
- filters later if needed
- status and progress display

### SettingsPage
Contains:
- output folder picker
- GPU toggle
- queue concurrency
- cache/temp settings

---

## Better Build Order for This UI

### Phase 1: Shell + Navigation
- [ ] Init Electron + React + Tailwind
- [ ] Build sidebar, top header, and app layout
- [ ] Add all 7 pages as static screens
- [ ] Match the mockup styling first

### Phase 2: Shared Task System
- [ ] FastAPI health route
- [ ] Task manager service
- [ ] WebSocket progress plumbing
- [ ] Frontend jobs store
- [ ] Queue page hooked to mock data, then real data

### Phase 3: Home Dashboard
- [ ] Quick action cards route to pages
- [ ] Quick input card
- [ ] Live processing card from jobs store
- [ ] Recent exports table from local task history

### Phase 4: Converter
- [ ] Drag/drop or file picker
- [ ] Output format selector
- [ ] FFmpeg endpoint
- [ ] Real progress + completed state

### Phase 5: Downloader
- [ ] URL input + clipboard paste
- [ ] Preset picker
- [ ] yt-dlp task support
- [ ] Real-time progress

### Phase 6: Voice Isolation
- [ ] Upload audio
- [ ] Demucs endpoint
- [ ] Progress reporting
- [ ] Stem output panel

### Phase 7: Background Remove
- [ ] Image upload
- [ ] rembg endpoint
- [ ] before/after preview
- [ ] PNG export

### Phase 8: Settings + Polish
- [ ] output folder picker
- [ ] desktop notifications
- [ ] keyboard shortcuts
- [ ] theme toggle
- [ ] open file/folder from result cards

---

## Changes I Would Make to the Backend Examples

Your service examples are mostly fine, but for this UI they should all report into one `task_manager`.

### Add a task manager concept
Each service should:
1. create a task record
2. update task progress
3. save outputs
4. mark done or error

Instead of every route inventing its own status logic.

Example task shape:

```python
{
    "id": "task_123",
    "type": "download",
    "name": "music_video.mov",
    "status": "processing",
    "progress": 62,
    "stage": "Extracting audio",
    "output_files": []
}
```

That is what powers:
- Home live processing
- Queue
- Recent exports
- per-tool result cards

---

## README Summary Section

```md
## MediaForge UI Architecture

MediaForge uses a dashboard-style desktop UI with a persistent sidebar and workspace pages.

Pages:
- Home
- Downloads
- Background Remove
- Voice Isolate
- Convert
- Queue
- Settings

The Home screen acts as the command center, showing quick actions, current jobs, and recent exports. All processing tasks feed into a unified task system so the Queue and Home widgets stay in sync.
```

---

## Cursor Prompt Updated for the Mockup

### App shell
```txt
Set up an Electron app with React, TypeScript, and Tailwind. Build a dark minimal desktop UI called MediaForge. The layout has a left sidebar and a main content area. Sidebar items are Home, Downloads, Background Remove, Voice Isolate, Convert, Queue, and Settings. The active item is highlighted with a white pill on a dark background.
```

### Home page
```txt
Build the MediaForge Home page. It should match a clean dark dashboard UI. Add a quick action grid with four cards: Download Video, Remove Background, Isolate Voice, Convert Files. Add a paste URL or choose file card below. On the right add a Live Processing panel with current jobs and progress. Below add a Recent Exports table with columns File, Tool, Status, and Size.
```

### Queue page
```txt
Build the Queue page for MediaForge. Show a vertical list of tasks with file name, tool type, and a status pill. Use a clean dark minimal style with rounded cards and subtle borders. This page should support queued, processing, done, and error states.
```

---

## Final corrected scaffold direction

Your original scaffold was solid for the backend tools, but the UI architecture did not match the mockup.

The corrected version should be centered around:
- **AppLayout**
- **Home dashboard**
- **feature workspaces**
- **unified queue**
- **settings**
- **shared task state**
