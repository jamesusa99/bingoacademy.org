import { GripVertical } from 'lucide-react'

export default function DragHandle({ label, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing ${className}`.trim()}
      title={label}
      aria-hidden
    >
      <GripVertical className="w-4 h-4" />
    </span>
  )
}
