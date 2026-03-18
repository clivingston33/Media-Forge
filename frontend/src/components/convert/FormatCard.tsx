interface FormatCardProps {
  label: string
  value: string
}

export function FormatCard({ label, value }: FormatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</div>
      <div className="mt-2 text-sm font-medium text-white/85">{value}</div>
    </div>
  )
}
