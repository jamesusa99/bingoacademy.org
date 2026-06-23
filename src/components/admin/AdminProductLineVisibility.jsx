import { useEffect, useState } from 'react'
import AdminAlert from './AdminAlert'
import {
  PRODUCT_LINE_ADMIN_META,
  PRODUCT_LINE_VISIBILITY_KEY,
  mergeProductLineVisibility,
} from '../../config/productLineVisibility'
import { fetchPlatformSetting, upsertPlatformSetting } from '../../lib/platformSettings'

export default function AdminProductLineVisibility({ labels }) {
  const [visibility, setVisibility] = useState(() => mergeProductLineVisibility(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPlatformSetting(PRODUCT_LINE_VISIBILITY_KEY)
      .then((value) => {
        if (!cancelled) setVisibility(mergeProductLineVisibility(value))
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
  }, [])

  const toggle = (lineId) => {
    setVisibility((v) => ({ ...v, [lineId]: !v[lineId] }))
    setSuccess(null)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await upsertPlatformSetting(PRODUCT_LINE_VISIBILITY_KEY, visibility)
      setSuccess(labels.saved)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6 mb-6">
      <h2 className="font-semibold text-bingo-dark mb-1">{labels.heading}</h2>
      <p className="text-sm text-slate-600 mb-4">{labels.desc}</p>

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
        <ul className="space-y-3 mb-4">
          {PRODUCT_LINE_ADMIN_META.map((line) => {
            const visible = visibility[line.id] !== false
            return (
              <li
                key={line.id}
                className="flex items-center justify-between gap-4 border border-slate-200 rounded-xl px-4 py-3"
              >
                <div>
                  <span className="text-lg mr-2" aria-hidden>
                    {line.icon}
                  </span>
                  <span className="font-medium text-bingo-dark">{line.name}</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {visible ? labels.statusVisible : labels.statusHidden}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={visible}
                  onClick={() => toggle(line.id)}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                    visible ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      visible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || saving}
        className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
      >
        {saving ? labels.saving : labels.save}
      </button>
    </div>
  )
}
