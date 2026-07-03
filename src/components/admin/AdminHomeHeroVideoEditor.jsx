import { useCallback, useEffect, useState } from 'react'
import AdminField from './AdminField'
import AdminAlert from './AdminAlert'
import { HOME_HERO_VIDEO_KEY, defaultHomeHeroVideo } from '../../config/homeHero'
import {
  fetchHomeHeroVideoForAdmin,
  invalidateHomeHeroVideoCache,
} from '../../hooks/useHomeHeroVideo'
import { upsertPlatformSetting } from '../../lib/platformSettings'

export default function AdminHomeHeroVideoEditor({ labels, saveLabel, savingLabel, resetLabel }) {
  const [form, setForm] = useState(defaultHomeHeroVideo())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setForm(await fetchHomeHeroVideoForAdmin())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await upsertPlatformSetting(HOME_HERO_VIDEO_KEY, form)
      invalidateHomeHeroVideoCache()
      setSuccess(labels.saved)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{labels.loading}</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{labels.desc}</p>
      {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success" onDismiss={() => setSuccess(null)}>{success}</AdminAlert> : null}
      <AdminField label={labels.videoUrl} showBadge={false}>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
          placeholder="https://…/hero-broll.mp4"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
        />
      </AdminField>
      <AdminField label={labels.posterUrl} showBadge={false}>
        <input
          type="url"
          value={form.posterUrl}
          onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))}
          placeholder="https://…/hero-poster.jpg"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
        />
      </AdminField>
      <p className="text-xs text-slate-500">{labels.hint}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? savingLabel : saveLabel}
        </button>
        <button
          type="button"
          onClick={() => setForm(defaultHomeHeroVideo())}
          className="px-5 py-2 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {resetLabel}
        </button>
      </div>
    </div>
  )
}
