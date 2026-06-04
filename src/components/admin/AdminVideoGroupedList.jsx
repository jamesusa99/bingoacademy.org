import { useMemo } from 'react'
import { groupVideosByCurriculum } from '../../lib/videoCurriculum'
import { CURRICULUM_LINES, getProgramCurriculum } from '../../config/programCurriculum'

function VideoRow({ row, labels, t, assignSlug, syncingId, onPreview, onSync, onAssign, onDelete, onAssignChange }) {
  const previewUrl = row.cloudflare_uid
    ? `https://iframe.cloudflarestream.com/${row.cloudflare_uid}`
    : null
  const ready = row.status === 'ready' && row.playback_url
  const selectedSlug = assignSlug[row.id] || row.catalog_slug || ''

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="p-3">
        <div className="font-medium">{row.title}</div>
        <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[220px]">
          {row.cloudflare_uid || '—'}
        </div>
      </td>
      <td className="p-3">
        <span
          className={
            row.status === 'ready'
              ? 'text-emerald-600'
              : row.status === 'error'
                ? 'text-red-600'
                : 'text-amber-600'
          }
        >
          {t(labels.statusKey(row.status))}
        </span>
      </td>
      <td className="p-3">
        {ready && previewUrl ? (
          <button
            type="button"
            onClick={() => onPreview({ url: previewUrl, title: row.title || row.cloudflare_uid })}
            className="text-xs text-primary hover:underline"
          >
            {labels.previewPlayer}
          </button>
        ) : (
          <span className="text-xs text-amber-600">{labels.encodingHint}</span>
        )}
      </td>
      <td className="p-3">
        {row.catalog_slug ? (
          <a
            href={`/courses/detail/${row.catalog_slug}?preview=1&from=admin`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline font-mono block mb-1"
          >
            {row.catalog_slug}
          </a>
        ) : null}
        <select
          value={selectedSlug}
          onChange={(e) => onAssignChange(row.id, e.target.value)}
          className="text-xs rounded border border-slate-200 px-2 py-1 max-w-[200px] w-full"
        >
          <option value="">{labels.selectCourse}</option>
          {labels.courseOptions?.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.slug} — {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="p-3 whitespace-nowrap space-x-2">
        <button
          type="button"
          disabled={syncingId === row.id}
          onClick={() => onSync(row)}
          className="text-xs text-primary hover:underline disabled:opacity-50"
        >
          {labels.sync}
        </button>
        <button
          type="button"
          disabled={syncingId === row.id || !selectedSlug}
          onClick={() => onAssign(row)}
          className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
        >
          {labels.assign}
        </button>
        <button type="button" onClick={() => onDelete(row.id)} className="text-xs text-red-600 hover:underline">
          {labels.delete}
        </button>
      </td>
    </tr>
  )
}

export default function AdminVideoGroupedList({
  items,
  lineFilter,
  labels,
  t,
  assignSlug,
  syncingId,
  courseOptions,
  onPreview,
  onSync,
  onAssign,
  onDelete,
  onAssignChange,
}) {
  const { byLine, unclassified } = useMemo(() => groupVideosByCurriculum(items), [items])

  const linesToShow =
    lineFilter === 'all' ? CURRICULUM_LINES.filter((l) => byLine.has(l)) : byLine.has(lineFilter) ? [lineFilter] : []

  const rowLabels = { ...labels, courseOptions, statusKey: labels.statusKey }

  if (!items.length) {
    return <p className="p-6 text-slate-500 text-sm">{labels.emptyList}</p>
  }

  return (
    <div className="divide-y divide-slate-100">
      {linesToShow.map((line) => {
        const lineGroup = byLine.get(line)
        const config = getProgramCurriculum(line)
        return (
          <div key={line} className="p-4">
            <h3 className="text-sm font-bold text-bingo-dark mb-3">
              {config.icon} {config.adminTitle}
            </h3>
            {[...lineGroup.stages.values()].map((stage) => (
              <div key={stage.stageSlug || stage.stage} className="mb-4 ml-2">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  {labels.colStage}: {stage.stage}
                </p>
                {[...stage.categories.values()].map((cat) => (
                  <div key={cat.category} className="mb-3 ml-3">
                    <p className="text-xs font-medium text-primary mb-1">
                      {labels.colCategory}: {cat.category}
                    </p>
                    {[...cat.modules.values()].map((mod) => (
                      <div key={mod.module} className="mb-2 ml-3">
                        <p className="text-[11px] text-slate-600 mb-1">
                          {labels.colModule}: {mod.module}
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full text-sm min-w-[720px]">
                            <thead className="bg-slate-50 text-left text-slate-600 text-xs">
                              <tr>
                                <th className="p-2">{labels.colTitle}</th>
                                <th className="p-2">{labels.colStatus}</th>
                                <th className="p-2">{labels.colPlayback}</th>
                                <th className="p-2">{labels.colCourse}</th>
                                <th className="p-2">{labels.colActions}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mod.items.map((row) => (
                                <VideoRow
                                  key={row.id}
                                  row={row}
                                  labels={rowLabels}
                                  t={t}
                                  assignSlug={assignSlug}
                                  syncingId={syncingId}
                                  onPreview={onPreview}
                                  onSync={onSync}
                                  onAssign={onAssign}
                                  onDelete={onDelete}
                                  onAssignChange={onAssignChange}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })}

      {(lineFilter === 'all' || lineFilter === 'other') && unclassified.length > 0 ? (
        <div className="p-4">
          <h3 className="text-sm font-bold text-slate-600 mb-3">{labels.unclassifiedHeading}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 text-left text-slate-600 text-xs">
                <tr>
                  <th className="p-2">{labels.colTitle}</th>
                  <th className="p-2">{labels.colStatus}</th>
                  <th className="p-2">{labels.colPlayback}</th>
                  <th className="p-2">{labels.colCourse}</th>
                  <th className="p-2">{labels.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {unclassified.map((row) => (
                  <VideoRow
                    key={row.id}
                    row={row}
                    labels={rowLabels}
                    t={t}
                    assignSlug={assignSlug}
                    syncingId={syncingId}
                    onPreview={onPreview}
                    onSync={onSync}
                    onAssign={onAssign}
                    onDelete={onDelete}
                    onAssignChange={onAssignChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
