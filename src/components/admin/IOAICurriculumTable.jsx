import { Fragment, useMemo, useState } from 'react'
import { ExternalLink, Pencil, Plus, Trash2, Video } from 'lucide-react'
import { COURSE_STATUS } from '../../config/coursesCatalog'
import { useAdminFormDraft } from '../../hooks/useAdminFormDraft'
import CurriculumCatalogFields, { CATALOG_FORM_DEFAULTS } from './CurriculumCatalogFields'
import CurriculumVideoUpload from './CurriculumVideoUpload'
import { formatIoaiPrice } from '../../lib/ioaiStore'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm'
const textareaClass = `${inputClass} min-h-[88px] resize-y`

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function IOAICurriculumTable({
  moduleGroups = [],
  loading,
  labels,
  onEditModule,
  onEditLesson,
  onDeleteLesson,
  deletingId,
  onAddCourse,
  onAddLessonToModule,
}) {
  const [stageFilter, setStageFilter] = useState('all')

  const stages = useMemo(() => {
    const seen = new Map()
    for (const group of moduleGroups) {
      if (!seen.has(group.stageSlug)) seen.set(group.stageSlug, group.stage)
    }
    return [...seen.entries()].map(([slug, title]) => ({ slug, title }))
  }, [moduleGroups])

  const visibleGroups = useMemo(() => {
    if (stageFilter === 'all') return moduleGroups
    return moduleGroups.filter((g) => g.stageSlug === stageFilter)
  }, [moduleGroups, stageFilter])

  const totalLessons = moduleGroups.reduce((n, g) => n + (g.lessons?.length || 0), 0)

  if (loading) {
    return <p className="p-8 text-sm text-slate-500 text-center">{labels.loading}</p>
  }

  if (!moduleGroups.length) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 space-y-4">
        <p>{labels.empty}</p>
        <p className="text-xs text-slate-400">{labels.emptyHint}</p>
        {onAddCourse ? (
          <button type="button" onClick={onAddCourse} className="btn-primary text-sm px-5 py-2.5">
            + {labels.addCourse}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStageFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            stageFilter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {labels.allStages}
        </button>
        {stages.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => setStageFilter(s.slug)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              stageFilter === s.slug ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colStage}</th>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colCategory}</th>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colModule}</th>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colModulePrice}</th>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colLesson}</th>
              <th className="p-3 font-semibold min-w-[140px]">{labels.colKnowledge}</th>
              <th className="p-3 font-semibold min-w-[160px]">{labels.colGoals}</th>
              <th className="p-3 font-semibold w-24">{labels.colVideo}</th>
              <th className="p-3 w-32 sticky right-0 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]" />
            </tr>
          </thead>
          <tbody>
            {visibleGroups.map((group) => {
              const modulePrice =
                group.catalogPrice ||
                (group.priceCents != null ? formatIoaiPrice(group.priceCents, group.currency) : labels.notSet)
              return (
                <Fragment key={group.moduleDbId}>
                  <tr className="border-t-2 border-primary/20 bg-primary/5 align-top">
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-xs text-slate-400 block">{group.stageEmoji}</span>
                      <span className="font-medium text-bingo-dark">{group.stage}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {group.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-bingo-dark">{group.moduleTitle}</p>
                      {group.catalogSlug ? (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{group.catalogSlug}</p>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-primary">{modulePrice}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {labels.moduleLessonCount(group.lessons?.length || 0)}
                      </p>
                    </td>
                    <td className="p-3 text-xs text-slate-400 italic" colSpan={3}>
                      {labels.moduleContainsLessons}
                    </td>
                    <td className="p-3 sticky right-0 bg-primary/5 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                      <div className="flex flex-col gap-1">
                        {onEditModule ? (
                          <button
                            type="button"
                            onClick={() => onEditModule(group)}
                            className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline px-2 py-1.5 rounded-lg hover:bg-primary/10 min-h-[36px]"
                          >
                            <Pencil className="w-3.5 h-3.5 shrink-0" />
                            {labels.editModule}
                          </button>
                        ) : null}
                        {onAddLessonToModule ? (
                          <button
                            type="button"
                            onClick={() => onAddLessonToModule(group)}
                            className="inline-flex items-center gap-1 text-slate-600 text-xs font-semibold hover:underline px-2 py-1.5 rounded-lg hover:bg-slate-100 min-h-[36px]"
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            {labels.addLessonToModule}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {(group.lessons || []).map((row) => (
                    <LessonRow
                      key={row.lessonId}
                      row={row}
                      labels={labels}
                      deletingId={deletingId}
                      onEditLesson={onEditLesson}
                      onDeleteLesson={onDeleteLesson}
                    />
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 text-right">
        {labels.moduleSummary(moduleGroups.length, totalLessons)}
      </p>
    </div>
  )
}

function LessonRow({ row, labels, deletingId, onEditLesson, onDeleteLesson }) {
  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/80 align-top group bg-white">
      <td className="p-3 pl-6" colSpan={3}>
        <p className="font-medium text-bingo-dark">{row.lessonTitle}</p>
        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{row.lessonSlug}</p>
      </td>
      <td className="p-3 text-[10px] text-slate-400 italic">{labels.lessonIncludedInModule}</td>
      <td className="p-3 text-xs text-slate-600">
        {row.knowledgePoints ? (
          <span className="line-clamp-2">{row.knowledgePoints}</span>
        ) : (
          <span className="text-slate-300 italic">{labels.notSet}</span>
        )}
      </td>
      <td className="p-3 text-xs text-slate-600">
        {row.contentGoals ? (
          <span className="line-clamp-2">{row.contentGoals}</span>
        ) : (
          <span className="text-slate-300 italic">{labels.notSet}</span>
        )}
      </td>
      <td className="p-3 text-xs">
        {row.cloudflareVideoId ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <Video className="w-3.5 h-3.5" />
            {labels.videoOk}
          </span>
        ) : (
          <span className="text-amber-600">{labels.noVideo}</span>
        )}
      </td>
      <td className="p-3 sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)] group-hover:bg-slate-50/80">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onEditLesson(row)}
            className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline px-2 py-1.5 rounded-lg hover:bg-primary/5 min-h-[36px]"
          >
            <Pencil className="w-3.5 h-3.5 shrink-0" />
            {labels.editLesson}
          </button>
          {onDeleteLesson ? (
            <button
              type="button"
              disabled={deletingId === row.lessonId}
              onClick={() => onDeleteLesson(row)}
              className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold hover:underline px-2 py-1.5 rounded-lg hover:bg-red-50 min-h-[36px] disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              {deletingId === row.lessonId ? labels.deleting : labels.deleteLesson}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

export function IOAIModuleEditor({ group, productLine, labels, saving, deleting, onSave, onDelete, onClose }) {
  const draftKey = `admin-curriculum-module-${group.moduleDbId}`
  const [form, setForm] = useAdminFormDraft(draftKey, {
    title: group.moduleTitle || '',
    summary: group.moduleSummary || '',
    intro_html: group.introHtml || '',
    cover_url: group.coverUrl || '',
    catalog_slug: group.catalogSlug || '',
    price: group.catalogPrice || '',
    price_cents: group.catalogPriceCents ?? group.priceCents ?? '',
    currency: group.currency || 'usd',
    ...CATALOG_FORM_DEFAULTS,
    status: group.status || COURSE_STATUS.LIVE,
    sort_order: group.sortOrder ?? 0,
  })

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const storePreview = group.catalogSlug
    ? `/courses/module/${encodeURIComponent(group.catalogSlug)}`
    : null

  return (
    <div className="card p-5 sm:p-6 border-2 border-amber-400/40 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1">
            {labels.editModule}
          </p>
          <p className="text-sm text-slate-600">
            {group.stage} · {group.category}
          </p>
          <p className="text-xs text-slate-500 mt-1">{labels.modulePriceHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {storePreview ? (
            <a
              href={storePreview}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {labels.previewModule}
            </a>
          ) : null}
          <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
            {labels.close}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={labels.colModule}>
          <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label={labels.moduleCatalogSlug}>
          <input
            className={inputClass}
            value={form.catalog_slug}
            onChange={(e) => set('catalog_slug', e.target.value)}
            placeholder={labels.phModuleCatalogSlug}
          />
        </Field>
      </div>

      <Field label={labels.moduleSummaryLabel}>
        <textarea
          className={textareaClass}
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          placeholder={labels.phModuleSummary}
        />
      </Field>

      <Field label={labels.moduleIntro}>
        <textarea
          className={`${textareaClass} min-h-[64px]`}
          value={form.intro_html}
          onChange={(e) => set('intro_html', e.target.value)}
          placeholder={labels.phModuleIntro}
        />
      </Field>

      <Field label={labels.moduleCover}>
        <input
          className={inputClass}
          value={form.cover_url}
          onChange={(e) => set('cover_url', e.target.value)}
          placeholder={labels.phModuleCover}
        />
        {form.cover_url?.trim() ? (
          <img
            src={form.cover_url.trim()}
            alt=""
            className="mt-2 h-28 w-full max-w-xs object-cover rounded-lg border border-slate-200"
          />
        ) : null}
        <p className="text-[10px] text-slate-400 mt-1">{labels.moduleCoverHint}</p>
      </Field>

      <CurriculumCatalogFields form={form} set={set} labels={labels} />

      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2">
          {labels.moduleLessonsTitle(group.lessons?.length || 0)}
        </p>
        <ul className="text-xs text-slate-600 space-y-1 max-h-32 overflow-y-auto">
          {(group.lessons || []).map((lesson) => (
            <li key={lesson.lessonId} className="font-mono">
              {lesson.lessonTitle} · {lesson.lessonSlug}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-slate-400 mt-2">{labels.moduleLessonsHint}</p>
      </div>

      <div className="flex flex-wrap justify-between gap-2 pt-2">
        {onDelete ? (
          <button
            type="button"
            disabled={saving || deleting}
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? labels.deleting : labels.deleteModule}
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
            {labels.cancel}
          </button>
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => onSave(form)}
            className="btn-primary px-5 py-2 text-sm disabled:opacity-60"
          >
            {saving ? labels.saving : labels.saveModule}
          </button>
        </div>
      </div>
    </div>
  )
}

export function IOAILessonEditor({ row, productLine, levels, labels, saving, deleting, onSave, onDelete, onClose }) {
  const draftKey = `admin-curriculum-edit-${row.lessonId}`
  const [form, setForm] = useAdminFormDraft(draftKey, {
    title: row.lessonTitle || '',
    knowledge_points: row.knowledgePoints || '',
    content_goals: row.contentGoals || '',
    cloudflare_video_id: row.cloudflareVideoId || '',
    catalog_slug: row.catalogSlug || row.lessonSlug || '',
    ...CATALOG_FORM_DEFAULTS,
    status: row.catalogStatus || COURSE_STATUS.LIVE,
    price: row.catalogPrice || '',
    price_cents: row.catalogPriceCents ?? '',
    currency: row.catalogCurrency || 'usd',
    sort_order: row.catalogSortOrder ?? row.sortOrder ?? 0,
    rating: row.catalogRating ?? 4.85,
    students: row.catalogStudents ?? 800,
  })

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const lessonPath = useMemo(
    () => ({
      stageChoice: row.levelId,
      themeChoice: row.themeId,
      moduleChoice: row.moduleId,
    }),
    [row.levelId, row.themeId, row.moduleId]
  )

  const previewHref = `/courses/detail/${encodeURIComponent(form.catalog_slug || row.lessonSlug)}?preview=1&from=admin&reload=1`

  const handleSave = () => {
    onSave(form)
  }

  return (
    <div className="card p-5 sm:p-6 border-2 border-primary/20 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1">
            {labels.editLesson}
          </p>
          <p className="text-sm text-slate-600">
            {row.stage} · {row.category} · {row.module}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{labels.draftHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {labels.preview}
          </a>
          <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
            {labels.close}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={labels.colStage}>
          <input className={inputClass} value={row.stage} readOnly disabled />
        </Field>
        <Field label={labels.colCategory}>
          <input className={inputClass} value={row.category} readOnly disabled />
        </Field>
        <Field label={labels.colModule}>
          <input className={inputClass} value={row.module} readOnly disabled />
        </Field>
        <Field label={labels.colLesson}>
          <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
      </div>

      <Field label={labels.colKnowledge}>
        <textarea
          className={textareaClass}
          value={form.knowledge_points}
          onChange={(e) => set('knowledge_points', e.target.value)}
          placeholder={labels.phKnowledge}
        />
      </Field>

      <Field label={labels.colGoals}>
        <textarea
          className={textareaClass}
          value={form.content_goals}
          onChange={(e) => set('content_goals', e.target.value)}
          placeholder={labels.phGoals}
        />
      </Field>

      <Field label={labels.catalogSlug}>
        <input
          className={inputClass}
          value={form.catalog_slug}
          onChange={(e) => set('catalog_slug', e.target.value)}
        />
      </Field>

      <CurriculumVideoUpload
        productLine={productLine}
        levels={levels}
        path={lessonPath}
        lessonTitle={form.title}
        catalogSlug={form.catalog_slug || row.lessonSlug}
        cloudflareUid={form.cloudflare_video_id}
        onUidChange={(uid) => set('cloudflare_video_id', uid)}
        labels={labels}
        disabled={saving}
      />

      <CurriculumCatalogFields form={form} set={set} labels={labels} />

      <p className="text-[10px] text-slate-400">{labels.lessonCatalogPriceHint}</p>

      <div className="flex flex-wrap justify-between gap-2 pt-2">
        {onDelete ? (
          <button
            type="button"
            disabled={saving || deleting}
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? labels.deleting : labels.deleteLesson}
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            disabled={saving || deleting}
            onClick={handleSave}
            className="btn-primary px-5 py-2 text-sm disabled:opacity-60"
          >
            {saving ? labels.saving : labels.save}
          </button>
        </div>
      </div>
    </div>
  )
}
