import { useEffect, useMemo, useState } from 'react'
import AdminAlert from './AdminAlert'
import AdminImageUpload from './AdminImageUpload'
import { PROGRAMS } from '../../config/programs'
import { defaultHomeHeroPrograms, HOME_HERO_PROGRAMS_KEY } from '../../config/homeHeroPrograms'
import {
  fetchHomeHeroProgramsForAdmin,
  invalidateHomeHeroProgramsCache,
} from '../../hooks/useHomeHeroPrograms'
import { upsertPlatformSetting } from '../../lib/platformSettings'

const CARD_CLASS = {
  ioai: 'border-amber-200/80 bg-amber-50/40',
  foundations: 'border-cyan-200/80 bg-cyan-50/40',
  k12: 'border-violet-200/80 bg-violet-50/40',
}

export default function AdminHomeHeroProgramsEditor({ labels, saveLabel, savingLabel, cancelLabel }) {
  const [form, setForm] = useState(defaultHomeHeroPrograms())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const photoLabels = useMemo(
    () => ({
      label: labels.coverLabel,
      upload: labels.coverUpload,
      uploading: labels.coverUploading,
      remove: labels.coverRemove,
      dropzone: labels.coverDropzone,
      dropzoneActive: labels.coverDropzoneActive,
      replace: labels.coverReplace,
      replaceBtn: labels.coverReplaceBtn,
      formats: labels.coverFormats,
      advanced: labels.coverAdvanced,
      urlPlaceholder: labels.coverUrlOptional,
      hint: labels.coverHint,
    }),
    [labels]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchHomeHeroProgramsForAdmin()
      .then((data) => {
        if (!cancelled) setForm(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setCover = (slug, url) => {
    setForm((prev) => ({
      ...prev,
      [slug]: { coverUrl: url },
    }))
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await upsertPlatformSetting(HOME_HERO_PROGRAMS_KEY, form)
      invalidateHomeHeroProgramsCache()
      setSuccess(labels.saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(defaultHomeHeroPrograms())
    setSuccess(null)
    setError(null)
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{labels.loading}</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{labels.desc}</p>
      {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success" onDismiss={() => setSuccess(null)}>{success}</AdminAlert> : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {PROGRAMS.map((program) => (
          <div
            key={program.slug}
            className={`card p-4 sm:p-5 border ${CARD_CLASS[program.slug] || 'border-slate-200'}`}
          >
            <p className="text-sm font-semibold text-bingo-dark mb-1">
              {program.icon} {program.title}
            </p>
            <p className="text-xs text-slate-500 mb-3">{program.audience}</p>
            <AdminImageUpload
              value={form[program.slug]?.coverUrl || ''}
              onChange={(url) => setCover(program.slug, url)}
              labels={photoLabels}
              folder="home-hero"
              aspectClass="aspect-[5/3]"
              maxWidthClass="max-w-full"
              disabled={saving}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60"
        >
          {saving ? savingLabel : saveLabel}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="px-5 py-2 rounded-xl border border-slate-300 text-sm"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}
