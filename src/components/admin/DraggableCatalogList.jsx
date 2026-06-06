import { useMemo, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { arrayMove } from '../../lib/arrayMove'
import { reorderCatalogCourses } from '../../lib/admin/catalog'
import { groupCatalogByCurriculum } from '../../lib/ioaiCourseStructure'
import { DEFAULT_ADMIN_PRODUCT_LINE, isCurriculumLine } from '../../config/programCurriculum'

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

function flattenGroupedOrder(grouped) {
  const list = []
  if (grouped.track) list.push(grouped.track)
  for (const level of grouped.levels) {
    for (const theme of level.themes) {
      for (const mod of theme.modules) {
        list.push(...mod.lessons)
      }
    }
  }
  list.push(...grouped.unassigned)
  return list
}

function GroupedCatalogList({ items, labels, onReorder, onEdit, onDelete, disabled, curriculumTree = [], productLine = DEFAULT_ADMIN_PRODUCT_LINE }) {
  const grouped = useMemo(
    () => groupCatalogByCurriculum(items, curriculumTree, productLine),
    [items, curriculumTree, productLine]
  )
  const [dragKey, setDragKey] = useState(null)
  const [overKey, setOverKey] = useState(null)
  const [saving, setSaving] = useState(false)

  const persistFromFlat = async (nextFlat) => {
    setSaving(true)
    try {
      await onReorder(nextFlat)
    } finally {
      setSaving(false)
    }
  }

  const dropLesson = async (targetSlug, moduleKey) => {
    if (!dragKey?.startsWith('lesson:') || saving) return
    const dragSlug = dragKey.slice('lesson:'.length)
    if (dragSlug === targetSlug) return

    const [, levelId, themeId, moduleId] = moduleKey.split(':')
    const level = grouped.levels.find((l) => l.id === levelId)
    const theme = level?.themes.find((t) => t.id === themeId)
    const mod = theme?.modules.find((m) => m.id === moduleId)
    if (!mod) return

    const slugs = mod.lessons.map((l) => l.slug)
    const from = slugs.indexOf(dragSlug)
    const to = slugs.indexOf(targetSlug)
    if (from < 0 || to < 0) return

    const nextLessons = arrayMove(mod.lessons, from, to)
    const nextFlat = []
    if (grouped.track) nextFlat.push(grouped.track)
    for (const lv of grouped.levels) {
      for (const th of lv.themes) {
        for (const m of th.modules) {
          if (lv.id === levelId && th.id === themeId && m.id === moduleId) {
            nextFlat.push(...nextLessons)
          } else {
            nextFlat.push(...m.lessons)
          }
        }
      }
    }
    nextFlat.push(...grouped.unassigned)
    await persistFromFlat(nextFlat)
  }

  const flatOrder = flattenGroupedOrder(grouped)

  return (
    <div className="divide-y divide-slate-100">
      {saving ? (
        <p className="px-4 py-2 text-xs text-primary bg-primary/5">{labels.savingOrder}</p>
      ) : null}
      <p className="px-4 py-2 text-xs text-slate-500 bg-slate-50">{labels.ioaiDragHint}</p>

      {grouped.track ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50/60">
          <DragHandle label={labels.dragHint} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase text-amber-700">{labels.coursePackage}</p>
            <p className="font-semibold text-bingo-dark truncate">{grouped.track.name}</p>
            <p className="text-xs text-slate-500 font-mono">{grouped.track.slug}</p>
          </div>
          <button type="button" onClick={() => onEdit(grouped.track)} className="text-primary text-xs shrink-0">
            {labels.edit}
          </button>
        </div>
      ) : null}

      {grouped.levels.map((level) => (
        <div key={level.id} className="border-t border-slate-200">
          <div className="px-4 py-2.5 bg-slate-100/90">
            <p className="text-[10px] font-bold uppercase text-slate-500">{labels.stage || '阶段'}</p>
            <p className="text-xs font-bold text-bingo-dark">
              {level.emoji} {level.title}
            </p>
          </div>

          {level.themes.map((theme) => (
            <div key={`${level.id}-${theme.id}`}>
              <div className="px-4 py-2 bg-white border-b border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {labels.category || '类别'}
                </p>
                <p className="text-xs font-semibold text-primary">{theme.title}</p>
              </div>

              {theme.modules.map((mod) => {
                const moduleKey = `${level.id}:${theme.id}:${mod.id}`
                return (
                  <div key={moduleKey} className="border-b border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/80 pl-8">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          {labels.module || '模块'}
                        </p>
                        <p className="text-sm font-semibold text-bingo-dark">{mod.title}</p>
                        <p className="text-xs text-slate-500">
                          {mod.lessons.length} {labels.lessons}
                        </p>
                      </div>
                    </div>

                    <ul className="divide-y divide-slate-100">
                      {mod.lessons.map((row) => (
                        <li
                          key={row.slug}
                          draggable={!disabled && !saving}
                          onDragStart={() => setDragKey(`lesson:${row.slug}`)}
                          onDragEnd={() => {
                            setDragKey(null)
                            setOverKey(null)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setOverKey(`lesson:${row.slug}`)
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            dropLesson(row.slug, moduleKey)
                            setOverKey(null)
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 pl-14 ${overKey === `lesson:${row.slug}` ? 'bg-primary/5' : 'hover:bg-slate-50/80'}`}
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
                      {!mod.lessons.length ? (
                        <li className="px-4 py-3 pl-14 text-xs text-amber-700 bg-amber-50/50">
                          No catalog rows — run seed or add lesson with slug matching curriculum
                        </li>
                      ) : null}
                    </ul>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ))}

      {grouped.unassigned.length > 0 ? (
        <div className="border-t border-amber-200">
          <p className="px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50">Unassigned IOAI lessons</p>
          <ul className="divide-y divide-slate-100">
            {grouped.unassigned.map((row) => (
              <li key={row.slug} className="flex items-center gap-3 px-4 py-2.5">
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
      ) : null}

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
  lineFilter = DEFAULT_ADMIN_PRODUCT_LINE,
  groupedByCurriculum = false,
  curriculumTree = [],
  productLine = DEFAULT_ADMIN_PRODUCT_LINE,
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

  const showGrouped = groupedByCurriculum && isCurriculumLine(lineFilter) && lineFilter === productLine

  if (showGrouped) {
    return (
      <GroupedCatalogList
        items={visible}
        labels={labels}
        onReorder={handleReorder}
        onEdit={onEdit}
        onDelete={onDelete}
        curriculumTree={curriculumTree}
        productLine={productLine}
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
