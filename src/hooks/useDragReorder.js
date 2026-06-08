import { useState } from 'react'
import { arrayMove } from '../lib/arrayMove'

/**
 * HTML5 drag-and-drop reorder for a flat list.
 * @param {{ items: object[], getKey?: (item: object) => string, onReorder: (next: object[]) => Promise<void>|void, disabled?: boolean }} opts
 */
export function useDragReorder({ items, getKey, onReorder, disabled = false }) {
  const keyOf = getKey || ((item) => item.slug ?? item.id ?? item.lessonId)
  const [dragKey, setDragKey] = useState(null)
  const [overKey, setOverKey] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleDrop = async (targetKey) => {
    setOverKey(null)
    if (disabled || saving || !dragKey || dragKey === targetKey) {
      setDragKey(null)
      return
    }

    const keys = items.map(keyOf)
    const from = keys.indexOf(dragKey)
    const to = keys.indexOf(targetKey)
    setDragKey(null)
    if (from < 0 || to < 0) return

    const next = arrayMove(items, from, to)
    setSaving(true)
    try {
      await onReorder(next)
    } finally {
      setSaving(false)
    }
  }

  const rowProps = (item) => {
    const key = keyOf(item)
    return {
      draggable: !disabled && !saving,
      onDragStart: () => setDragKey(key),
      onDragEnd: () => {
        setDragKey(null)
        setOverKey(null)
      },
      onDragOver: (e) => {
        e.preventDefault()
        setOverKey(key)
      },
      onDrop: (e) => {
        e.preventDefault()
        handleDrop(key)
      },
      'data-drag-key': key,
      className: [
        dragKey === key ? 'opacity-50' : '',
        overKey === key && dragKey !== key ? 'bg-primary/5' : '',
      ]
        .filter(Boolean)
        .join(' '),
    }
  }

  return { dragKey, overKey, saving, rowProps }
}
