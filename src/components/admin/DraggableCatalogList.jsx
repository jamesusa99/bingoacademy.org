import { useMemo, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { arrayMove } from '../../lib/arrayMove'
import { reorderCatalogCourses } from '../../lib/admin/catalog'
import { IOAI_COURSE_SYSTEM } from '../../config/ioaiCourseSystem'
import { IOAI_TRACK_ID, isIOAILessonId, parseIOAILessonId } from '../../lib/ioaiCourseStructure'

function sortByOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function DragHandle({ label }) {
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing"
      title={label}
      aria-hidden
    >
      <GripVertical className="w-4 h-4" />
    </span>
  )
}

function useDragReorder({ items, onReorder, disabled }) {
  const [dragSlug, setDragSlug] = useState(null)
  const [overSlug, setOverSlug] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleDrop = async (targetSlug) => {
    setOverSlug(null)
    if (disabled || saving || !dragSlug || dragSlug === targetSlug) {
      setDragSlug(null)
      return
    }

    const slugs = items.map((r) => r.slug)
    const from = slugs.indexOf(dragSlug)
    const to = slugs.indexOf(targetSlug)
    setDragSlug(null)
    if (from < 0 || to < 0) return

    const next = arrayMove(items, from, to)
    setSaving(true)
    try {
      await onReorder(next)
    } finally {
      setSaving(false)
    }
  }

  return {
    dragSlug,
    overSlug,
    saving,
    setDragSlug,
    setOverSlug,
    handleDrop,
    rowProps: (slug) => ({
      draggable: !disabled && !saving,
      onDragStart: () => setDragSlug(slug),
      onDragEnd: () => {
        setDragSlug(null)
        setOverSlug(null)
      },
      onDragOver: (e) => {
        e.preventDefault()
        setOverSlug(slug)
      },
      onDrop: (e) => {
        e.preventDefault()
        handleDrop(slug)
      },
      className: [
        'border-t border-slate-100 transition-colors',
        dragSlug === slug ? 'opacity-50' : '',
        overSlug === slug && dragSlug !== slug ? 'bg-primary/5' : '',
      ]
        .filter(Boolean)
        .join(' '),
    }),
  }
}

function FlatCatalogTable({ items, labels, onReorder, onEdit, onDelete, disabled }) {
  const drag = useDragReorder({ items, onReorder, disabled })

  return (
    <div className="overflow-x-auto">
      {drag.saving ? (
        <p className="px-4 py-2 text-xs text-primary bg-primary/5 border-b border-primary/10">{labels.savingOrder}</p>
      ) : null}
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="p-3 w-10" aria-label={labels.dragHint} />
            <th className="p-3">{labels.name}</th>
            <th className="p-3">Line / Sub</th>
            <th className="p-3">{labels.status}</th>
            <th className="p-3">{labels.price}</th>
            <th className="p-3">Slug</th>
            <th className="p-3">{labels.video}</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.slug} {...drag.rowProps(row.slug)}>
              <td className="p-2">
                <DragHandle label={labels.dragHint} />
              </td>
              <td className="p-3 font-medium">
                {row.name}
                {row.featured ? <span className="ml-1 text-xs text-amber-600">★</span> : null}
              </td>
              <td className="p-3 text-xs capitalize">
                {row.line} / {row.sub}
              </td>
              <td className="p-3">{row.status}</td>
              <td className="p-3 text-slate-600">{row.price || '—'}</td>
              <td className="p-3 text-xs font-mono text-slate-400">{row.slug}</td>
              <td className="p-3 text-xs">
                {row.video_url ? (
                  <span className="text-emerald-600 font-medium">{labels.streamOk}</span>
                ) : row.delivery_type === 'video' ? (
                  <span className="text-amber-600">{labels.noVideo}</span>
                ) : (
                  '—'
                )}
              </td>
              <td className="p-3 whitespace-nowrap">
                <button type="button" onClick={() => onEdit(row)} className="text-primary mr-2">
                  {labels.edit}
                </button>
                <button type="button" onClick={() => onDelete(row.slug)} className="text-red-600">
                  {labels.delete}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function groupIOAICatalog(items) {
  const sorted = sortByOrder(items)
  const track = sorted.find((r) => r.slug === IOAI_TRACK_ID) ?? null
  const lessonRows = sorted.filter((r) => isIOAILessonId(r.slug))

  const moduleMap = new Map()
  for (const row of lessonRows) {
    const parsed = parseIOAILessonId(row.slug)
    if (!parsed) continue
    if (!moduleMap.has(parsed.module)) moduleMap.set(parsed.module, [])
    moduleMap.get(parsed.module).push(row)
  }

  const modules = IOAI_COURSE_SYSTEM.modules
    .filter((mod) => moduleMap.has(mod.number))
    .map((mod) => ({
      ...mod,
      lessons: sortByOrder(moduleMap.get(mod.number) || []),
    }))
    .sort((a, b) => {
      const minA = a.lessons[0]?.sort_order ?? 0
      const minB = b.lessons[0]?.sort_order ?? 0
      return minA - minB
    })

  return { track, modules }
}

function IOAIGroupedCatalogList({ items, labels, onReorder, onEdit, onDelete, disabled }) {
  const grouped = useMemo(() => groupIOAICatalog(items), [items])
  const [dragKind, setDragKind] = useState(null)
  const [dragKey, setDragKey] = useState(null)
  const [overKey, setOverKey] = useState(null)
  const [saving, setSaving] = useState(false)

  const flatOrder = useMemo(() => {
    const list = []
    if (grouped.track) list.push(grouped.track)
    for (const mod of grouped.modules) {
      list.push(...mod.lessons)
    }
    return list
  }, [grouped])

  const persistFromFlat = async (nextFlat) => {
    setSaving(true)
    try {
      await onReorder(nextFlat)
    } finally {
      setSaving(false)
    }
  }

  const dropModule = async (targetModuleNumber) => {
    if (!dragKey?.startsWith('module:') || saving) return
    const fromModule = Number(dragKey.split(':')[1])
    if (fromModule === targetModuleNumber) return

    const fromIdx = grouped.modules.findIndex((m) => m.number === fromModule)
    const toIdx = grouped.modules.findIndex((m) => m.number === targetModuleNumber)
    if (fromIdx < 0 || toIdx < 0) return

    const nextModules = arrayMove(grouped.modules, fromIdx, toIdx)
    const nextFlat = []
    if (grouped.track) nextFlat.push(grouped.track)
    for (const mod of nextModules) nextFlat.push(...mod.lessons)
    await persistFromFlat(nextFlat)
  }

  const dropLesson = async (targetSlug, moduleNumber) => {
    if (!dragKey?.startsWith('lesson:') || saving) return
    const dragSlug = dragKey.slice('lesson:'.length)
    if (dragSlug === targetSlug) return

    const module = grouped.modules.find((m) => m.number === moduleNumber)
    if (!module) return

    const slugs = module.lessons.map((l) => l.slug)
    const from = slugs.indexOf(dragSlug)
    const to = slugs.indexOf(targetSlug)
    if (from < 0 || to < 0) return

    const nextLessons = arrayMove(module.lessons, from, to)
    const nextFlat = []
    if (grouped.track) nextFlat.push(grouped.track)
    for (const mod of grouped.modules) {
      if (mod.number === moduleNumber) nextFlat.push(...nextLessons)
      else nextFlat.push(...mod.lessons)
    }
    await persistFromFlat(nextFlat)
  }

  const dropTrack = async () => {
    if (dragKind !== 'track' || !grouped.track || saving) return
    // Track stays first; no-op drop target
  }

  return (
    <div className="divide-y divide-slate-100">
      {saving ? (
        <p className="px-4 py-2 text-xs text-primary bg-primary/5">{labels.savingOrder}</p>
      ) : null}
      <p className="px-4 py-2 text-xs text-slate-500 bg-slate-50">{labels.ioaiDragHint}</p>

      {grouped.track ? (
        <div
          draggable={!disabled && !saving}
          onDragStart={() => {
            setDragKind('track')
            setDragKey(`track:${grouped.track.slug}`)
          }}
          onDragEnd={() => {
            setDragKind(null)
            setDragKey(null)
            setOverKey(null)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setOverKey('track')
          }}
          onDrop={(e) => {
            e.preventDefault()
            dropTrack()
            setOverKey(null)
          }}
          className={`flex items-center gap-3 px-4 py-3 bg-amber-50/60 ${overKey === 'track' ? 'ring-2 ring-inset ring-primary/30' : ''}`}
        >
          <DragHandle label={labels.dragHint} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase text-amber-700">{labels.coursePackage}</p>
            <p className="font-semibold text-bingo-dark truncate">{grouped.track.name}</p>
            <p className="text-xs text-slate-500 font-mono">{grouped.track.slug}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => onEdit(grouped.track)} className="text-primary text-xs">
              {labels.edit}
            </button>
          </div>
        </div>
      ) : null}

      {grouped.modules.map((mod) => (
        <div key={mod.number} className="border-t border-slate-100">
          <div
            draggable={!disabled && !saving}
            onDragStart={() => {
              setDragKind('module')
              setDragKey(`module:${mod.number}`)
            }}
            onDragEnd={() => {
              setDragKind(null)
              setDragKey(null)
              setOverKey(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setOverKey(`module:${mod.number}`)
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (dragKind === 'module') dropModule(mod.number)
              setOverKey(null)
            }}
            className={`flex items-center gap-3 px-4 py-3 bg-slate-50 ${overKey === `module:${mod.number}` ? 'ring-2 ring-inset ring-primary/30' : ''}`}
          >
            <DragHandle label={labels.dragModule} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase text-primary">
                {labels.module} {mod.number}
              </p>
              <p className="font-semibold text-bingo-dark">{mod.title}</p>
              <p className="text-xs text-slate-500">{mod.lessons.length} {labels.lessons}</p>
            </div>
          </div>

          <ul className="divide-y divide-slate-100">
            {mod.lessons.map((row) => (
              <li
                key={row.slug}
                draggable={!disabled && !saving}
                onDragStart={() => {
                  setDragKind('lesson')
                  setDragKey(`lesson:${row.slug}`)
                }}
                onDragEnd={() => {
                  setDragKind(null)
                  setDragKey(null)
                  setOverKey(null)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOverKey(`lesson:${row.slug}`)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragKind === 'lesson') dropLesson(row.slug, mod.number)
                  setOverKey(null)
                }}
                className={`flex items-center gap-3 px-4 py-2.5 pl-10 ${overKey === `lesson:${row.slug}` ? 'bg-primary/5' : 'hover:bg-slate-50/80'}`}
              >
                <DragHandle label={labels.dragLesson} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bingo-dark truncate">{row.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{row.slug}</p>
                </div>
                <div className="flex gap-2 shrink-0 text-xs">
                  <button type="button" onClick={() => onEdit(row)} className="text-primary">
                    {labels.edit}
                  </button>
                  <button type="button" onClick={() => onDelete(row.slug)} className="text-red-600">
                    {labels.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {flatOrder.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">{labels.noCourses}</p>
      ) : null}
    </div>
  )
}

export default function DraggableCatalogList({
  items,
  labels,
  onEdit,
  onDelete,
  onReorderComplete,
  lineFilter = 'all',
  groupedIOAI = false,
}) {
  const sorted = useMemo(() => sortByOrder(items), [items])

  const visible = useMemo(() => {
    if (lineFilter === 'all') return sorted
    return sorted.filter((r) => r.line === lineFilter)
  }, [sorted, lineFilter])

  const handleReorder = async (nextVisible) => {
    const allSorted = sortByOrder(items)

    let merged
    if (lineFilter === 'all') {
      merged = nextVisible
    } else {
      const visibleSlugs = new Set(nextVisible.map((r) => r.slug))
      const firstVisibleIdx = allSorted.findIndex((r) => visibleSlugs.has(r.slug))
      const before = firstVisibleIdx >= 0 ? allSorted.slice(0, firstVisibleIdx) : []
      const after =
        firstVisibleIdx >= 0
          ? allSorted.slice(firstVisibleIdx).filter((r) => !visibleSlugs.has(r.slug))
          : allSorted.filter((r) => !visibleSlugs.has(r.slug))
      merged = [...before, ...nextVisible, ...after]
    }

    await reorderCatalogCourses(merged.map((row, sort_order) => ({ slug: row.slug, sort_order })))
    onReorderComplete?.()
  }

  const showGrouped = groupedIOAI && lineFilter === 'ioai'

  if (showGrouped) {
    return (
      <IOAIGroupedCatalogList
        items={visible}
        labels={labels}
        onReorder={handleReorder}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
  }

  return (
    <FlatCatalogTable
      items={visible}
      labels={labels}
      onReorder={handleReorder}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
