const LEVEL_CONFIG = {
  beginner: { label: 'Beginner', className: 'bg-emerald-500 text-white' },
  intermediate: { label: 'Intermediate', className: 'bg-amber-500 text-white' },
  advanced: { label: 'Advanced', className: 'bg-red-500 text-white' },
}

export default function LevelBadge({ level }) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.beginner
  return (
    <span
      className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow ${config.className}`}
    >
      {config.label}
    </span>
  )
}
