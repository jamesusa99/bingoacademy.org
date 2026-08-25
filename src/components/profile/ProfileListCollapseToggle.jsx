import { useMemo, useState } from 'react'

export const PROFILE_LIST_PREVIEW_LIMIT = 3

export function useProfileListCollapse(items, limit = PROFILE_LIST_PREVIEW_LIMIT) {
  const [expanded, setExpanded] = useState(false)
  const list = items || []
  const collapsible = list.length > limit
  const visible = useMemo(
    () => (collapsible && !expanded ? list.slice(0, limit) : list),
    [collapsible, expanded, list, limit]
  )
  const hiddenCount = Math.max(0, list.length - limit)

  return {
    visible,
    collapsible,
    expanded,
    hiddenCount,
    toggle: () => setExpanded((v) => !v),
  }
}

export default function ProfileListCollapseToggle({ collapsible, expanded, hiddenCount, onToggle, itemLabel = 'items' }) {
  if (!collapsible) return null

  return (
    <div className="border-t border-slate-100">
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-3 text-sm font-medium text-primary hover:bg-slate-50 transition flex items-center justify-center gap-2"
        aria-expanded={expanded}
      >
        <span>
          {expanded ? `Show less` : `Show ${hiddenCount} more ${itemLabel}`}
        </span>
        <span className={`text-xs text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden>
          ▼
        </span>
      </button>
    </div>
  )
}
