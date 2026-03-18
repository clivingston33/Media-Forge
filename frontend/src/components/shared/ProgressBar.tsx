interface ProgressBarProps {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const bounded = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className="h-2 rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-[linear-gradient(90deg,#f4b860_0%,#7cc7ff_100%)] transition-all"
        style={{ width: `${bounded}%` }}
      />
    </div>
  )
}
