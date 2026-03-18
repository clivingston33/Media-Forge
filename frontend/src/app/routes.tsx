import {
  AudioLines,
  Clapperboard,
  Download,
  House,
  ImageIcon,
  ListTodo,
  Settings2,
  type LucideIcon,
} from 'lucide-react'

export interface MediaForgeRoute {
  path: string
  label: string
  title: string
  description: string
  icon: LucideIcon
}

export const APP_ROUTES: MediaForgeRoute[] = [
  {
    path: '/',
    label: 'Home',
    title: 'Media workspace',
    description: 'Download, clean, convert, and extract media in one local workflow.',
    icon: House,
  },
  {
    path: '/downloads',
    label: 'Downloads',
    title: 'Downloads',
    description: 'Paste links, inspect presets, and queue local exports.',
    icon: Download,
  },
  {
    path: '/background-remove',
    label: 'Background Remove',
    title: 'Background Remove',
    description: 'Separate subjects from backgrounds for stills and video frames.',
    icon: ImageIcon,
  },
  {
    path: '/voice-isolate',
    label: 'Voice Isolate',
    title: 'Voice Isolate',
    description: 'Extract vocals, dialogue, and stems with AI-powered separation.',
    icon: AudioLines,
  },
  {
    path: '/convert',
    label: 'Convert',
    title: 'Convert Files',
    description: 'Transcode media into edit-ready formats, codecs, and delivery targets.',
    icon: Clapperboard,
  },
  {
    path: '/queue',
    label: 'Queue',
    title: 'Processing Queue',
    description: 'Track all active jobs, completed exports, and errors in one place.',
    icon: ListTodo,
  },
  {
    path: '/settings',
    label: 'Settings',
    title: 'Settings',
    description: 'Manage folders, performance options, and local processing defaults.',
    icon: Settings2,
  },
]

export function getRouteByPath(pathname: string) {
  return APP_ROUTES.find((route) => route.path === pathname) ?? APP_ROUTES[0]
}
