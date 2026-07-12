import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminAlert from './AdminAlert'
import AdminField from './AdminField'
import { coursePathForLineId } from '../../config/coursePaths'
import { VIDEO_COURSE_SUB_BY_LINE } from '../../config/courseListFilters'
import { defaultCoursesLineHero, coursesLineHeroKey } from '../../config/coursesLineHero'
import { upsertPlatformSetting } from '../../lib/platformSettings'
import {
  fetchCoursesLineHeroForAdmin,
  invalidateCoursesLineHeroCache,
} from '../../hooks/useCoursesLineHero'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
const textareaClass = `${inputClass} min-h-[88px] resize-y`

const CARD_CLASS = {
  ioai: 'border-cyan-200/60 bg-cyan-50/30',
  general: 'border-sky-200/60 bg-sky-50/30',
  k12: 'border-violet-200/60 bg-violet-50/30',
}

export default function AdminCoursesLineHeroEditor({ lineId, labels }) {
  const defaults = defaultCoursesLineHero(lineId)
  const settingKey = coursesLineHeroKey(lineId)
  const previewHref =
    lineId === 'ioai'
      ? '/courses/ioai'
      : coursePathForLineId(lineId, VIDEO_COURSE_SUB_BY_LINE[lineId] || 'course')

  const [form, setForm] = useState(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchCoursesLineHeroForAdmin(lineId)
      .then((hero) => {
        if (!cancelled) setForm(hero)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lineId])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!settingKey) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await upsertPlatformSetting(settingKey, {
        modulesTitle: form.modulesTitle.trim(),
        modulesSubtitle: form.modulesSubtitle.trim(),
        statStudents: form.statStudents.trim(),
        statRating: form.statRating.trim(),
      })
      invalidateCoursesLineHeroCache(lineId)
      setSuccess(labels.heroSaved)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(defaultCoursesLineHero(lineId))
    setSuccess(null)
    setError(null)
  }

  if (!settingKey) return null

  return (
    <section className={`card border overflow-hidden ${CARD_CLASS[lineId] || CARD_CLASS.general}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/40 transition"
      >
        <div>
          <p className="text-sm font-semibold text-bingo-dark">{labels.heroSectionTitle}</p>
          <p className="text-xs text-slate-600 mt-0.5">{labels.heroSectionDesc}</p>
        </div>
        <span className="text-xs font-semibold text-primary shrink-0">
          {open ? labels.heroCollapse : labels.heroExpand}
        </span>
      </button>

      {open ? (
        <div className="px-5 pb-5 pt-0 space-y-4 border-t border-white/60">
          {error ? (
            <AdminAlert type="error" onDismiss={() => setError(null)}>
              {error}
            </AdminAlert>
          ) : null}
          {success ? (
            <AdminAlert type="success" onDismiss={() => setSuccess(null)}>
              {success}
            </AdminAlert>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">{labels.loading}</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <AdminField label={labels.heroModulesTitle} required>
                  <input
                    className={inputClass}
                    value={form.modulesTitle}
                    onChange={(e) => set('modulesTitle', e.target.value)}
                    placeholder={defaults.modulesTitle}
                  />
                </AdminField>
                <AdminField label={labels.heroStatStudents}>
                  <input
                    className={inputClass}
                    value={form.statStudents}
                    onChange={(e) => set('statStudents', e.target.value)}
                    placeholder="800"
                  />
                </AdminField>
                <AdminField label={labels.heroStatRating}>
                  <input
                    className={inputClass}
                    value={form.statRating}
                    onChange={(e) => set('statRating', e.target.value)}
                    placeholder="4.9"
                  />
                </AdminField>
              </div>

              <AdminField label={labels.heroModulesSubtitle} required>
                <textarea
                  className={textareaClass}
                  value={form.modulesSubtitle}
                  onChange={(e) => set('modulesSubtitle', e.target.value)}
                  placeholder={defaults.modulesSubtitle}
                />
              </AdminField>

              <p className="text-[11px] text-slate-500 leading-relaxed">{labels.heroStatsHint}</p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.modulesTitle.trim() || !form.modulesSubtitle.trim()}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
                >
                  {saving ? labels.saving : labels.heroSave}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-60"
                >
                  {labels.heroResetDefaults}
                </button>
                <Link
                  to={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline ml-auto"
                >
                  {labels.heroPreview} ↗
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}
