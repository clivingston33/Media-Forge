import { AlertCircle, Ban, CheckCircle2, LoaderCircle, TimerReset } from 'lucide-react'
import { formatStatus } from '../../lib/formatters'
import type { TaskStatus } from '../../lib/task-types'

const toneMap: Record<TaskStatus, string> = {
  queued: 'border-[rgba(244,184,96,0.28)] bg-[rgba(244,184,96,0.12)] text-[#ffd7a0]',
  processing: 'border-white/10 bg-white/[0.06] text-white/80',
  done: 'border-[rgba(99,209,171,0.22)] bg-[rgba(99,209,171,0.14)] text-[#b4f0db]',
  error: 'border-[rgba(239,127,127,0.22)] bg-[rgba(239,127,127,0.14)] text-[#ffc2c2]',
  cancelled: 'border-[rgba(188,194,207,0.22)] bg-[rgba(188,194,207,0.12)] text-[#dde3ee]',
}

const iconMap = {
  queued: TimerReset,
  processing: LoaderCircle,
  done: CheckCircle2,
  error: AlertCircle,
  cancelled: Ban,
} satisfies Record<TaskStatus, typeof TimerReset>

interface StatusPillProps {
  status: TaskStatus
}

export function StatusPill({ status }: StatusPillProps) {
  const Icon = iconMap[status]

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${toneMap[status]}`}>
      <Icon className={`h-3.5 w-3.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {formatStatus(status)}
    </span>
  )
}
