export interface QuickAction {
  title: string
  description: string
  route: string
  eyebrow: string
}

export interface DownloadPreset {
  label: string
  format: 'mp4' | 'mp3' | 'webm'
  quality: 'best' | '1080p' | '720p' | '480p' | 'audio_only'
  description: string
}

export interface VoicePreset {
  label: string
  mode: 'vocals' | 'all_stems'
  description: string
}

export interface ConvertTarget {
  label: string
  format: 'mp3' | 'wav' | 'mp4' | 'mov' | 'gif' | 'flac' | 'aac' | 'webm'
  description: string
}
