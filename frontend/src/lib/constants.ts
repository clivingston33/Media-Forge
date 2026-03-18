import type { AppSettings } from '../types/settings'
import type { ConvertTarget, DownloadPreset, QuickAction, VoicePreset } from '../types/media'

export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Download Video',
    description: 'Paste a URL and grab clean local MP4 or MP3 exports with one queue entry.',
    route: '/downloads',
    eyebrow: 'yt-dlp',
  },
  {
    title: 'Remove Background',
    description: 'Create transparent cutouts for stills and clips with export-ready previews.',
    route: '/background-remove',
    eyebrow: 'rembg',
  },
  {
    title: 'Isolate Voice',
    description: 'Split dialogue or vocals from the mix for editing, cleanup, or remixing.',
    route: '/voice-isolate',
    eyebrow: 'Demucs',
  },
  {
    title: 'Convert Files',
    description: 'Transcode footage and audio into edit-friendly formats and delivery presets.',
    route: '/convert',
    eyebrow: 'FFmpeg',
  },
]

export const DOWNLOAD_PRESETS: DownloadPreset[] = [
  {
    label: 'MP4 1080p',
    format: 'mp4',
    quality: '1080p',
    description: 'Best for editing and archive playback.',
  },
  {
    label: 'MP3 320 kbps',
    format: 'mp3',
    quality: 'audio_only',
    description: 'Audio-only extraction for music or podcasts.',
  },
  {
    label: 'WEBM Best',
    format: 'webm',
    quality: 'best',
    description: 'Efficient web delivery with original quality preference.',
  },
]

export const VOICE_PRESETS: VoicePreset[] = [
  {
    label: 'Speech Focus',
    mode: 'vocals',
    description: 'Prioritize dialogue and narration clarity.',
  },
  {
    label: 'Vocal Only',
    mode: 'vocals',
    description: 'Pull lead vocals for music cleanup or remix prep.',
  },
  {
    label: 'All Stems',
    mode: 'all_stems',
    description: 'Export separate stems for a fuller breakdown.',
  },
]

export const CONVERT_TARGETS: ConvertTarget[] = [
  {
    label: 'Premiere Ready',
    format: 'mp4',
    description: 'H.264 delivery for quick review and offline edits.',
  },
  {
    label: 'After Effects Proxy',
    format: 'mov',
    description: 'Lighter mezzanine output for motion workflows.',
  },
  {
    label: 'Audio WAV',
    format: 'wav',
    description: 'Uncompressed export for mastering and cleanup.',
  },
  {
    label: 'Web GIF',
    format: 'gif',
    description: 'Short motion exports for social and docs.',
  },
]

export const DEFAULT_SETTINGS: AppSettings = {
  gpu_acceleration: true,
  output_folder: 'C:/MediaForge/Exports',
  queue_concurrency: 2,
  temp_cache_gb: 12,
  auto_save_exports: true,
}
