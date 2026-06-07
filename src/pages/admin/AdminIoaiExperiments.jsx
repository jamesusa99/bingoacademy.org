import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlaskConical, Plus, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import {
  adminCreateExperiment,
  adminDeleteExperiment,
  adminFetchExperiments,
  adminUpdateExperiment,
} from '../../lib/ioaiExperimentsClient'

const EMPTY = {
  slug: '',
  title: '',
  subtitle: '',
  cover_url: '',
  intro_html: '',
  description: '',
  play_type: 'training_lab',
  play_target: '',
  status: 'live',
  sort_order: 0,
  marketing_tags: '',
  materials: [],
}

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function AdminIoaiExperiments() {
  const c = useAdminCrud()
  const t = c.t
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { experiments } = await adminFetchExperiments()
      setItems(experiments || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const startEdit = (row) => {
    setEditingId(row.id)
    setForm({
      slug: row.slug || '',
      title: row.title || '',
      subtitle: row.subtitle || '',
      cover_url: row.coverUrl || '',
      intro_html: row.introHtml || '',
      description: row.description || '',
      play_type: row.playType || 'training_lab',
      play_target: row.playTarget || '',
      status: row.status || 'live',
      sort_order: row.sortOrder ?? 0,
      marketing_tags: (row.marketingTags || []).join(', '),
      materials: (row.materials || []).map((m) => ({
        file_name: m.fileName,
        file_url: m.fileUrl,
        sort_order: m.sortOrder ?? 0,
      })),
    })
    setSuccess(null)
  }

  const startNew = () => {
    setEditingId('new')
    setForm(EMPTY)
    setSuccess(null)
  }

  const payloadFromForm = () => ({
    slug: form.slug.trim(),
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || null,
    cover_url: form.cover_url.trim() || null,
    intro_html: form.intro_html.trim() || null,
    description: form.description.trim() || null,
    play_type: form.play_type,
    play_target: form.play_target.trim() || null,
    status: form.status,
    sort_order: parseInt(form.sort_order, 10) || 0,
    marketing_tags: form.marketing_tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    materials: form.materials,
  })

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = payloadFromForm()
      if (editingId && editingId !== 'new') {
        await adminUpdateExperiment(editingId, payload)
        setSuccess('Experiment updated.')
      } else {
        await adminCreateExperiment(payload)
        setSuccess('Experiment created.')
      }
      setEditingId(null)
      setForm(EMPTY)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm(t('crud.confirmDeleteGeneric'))) return
    setSaving(true)
    try {
      await adminDeleteExperiment(id)
      if (editingId === id) {
        setEditingId(null)
        setForm(EMPTY)
      }
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addMaterial = () => {
    setForm((f) => ({
      ...f,
      materials: [...f.materials, { file_name: '', file_url: '', sort_order: f.materials.length }],
    }))
  }

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [items]
  )

  return (
    <div>
      <AdminPageHeader
        title="IOAI Experiments"
        desc="Public experiment library — bind to L4 lessons (free with module) or sell in lab packs."
        icon={<FlaskConical className="w-5 h-5" />}
      />

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <div className="flex flex-wrap gap-2 mb-4">
        <button type="button" onClick={startNew} className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          {t('crud.addNew')}
        </button>
      </div>

      {editingId ? (
        <div className="card p-5 mb-6 border-2 border-primary/20 space-y-4">
          <p className="text-xs font-bold uppercase text-primary">
            {editingId === 'new' ? t('crud.addItem', { item: 'Experiment' }) : t('crud.editItem', { item: 'Experiment' })}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Slug">
              <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
            </Field>
            <Field label={t('crud.title')}>
              <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <input className={inputClass} value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
            </Field>
            <Field label={t('crud.status')}>
              <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="live">live</option>
                <option value="draft">draft</option>
                <option value="hidden">hidden</option>
              </select>
            </Field>
            <Field label="Play type">
              <select className={inputClass} value={form.play_type} onChange={(e) => set('play_type', e.target.value)}>
                <option value="training_lab">training_lab</option>
                <option value="exploration">exploration</option>
                <option value="external_url">external_url</option>
              </select>
            </Field>
            <Field label="Play target (lab id or URL)">
              <input className={inputClass} value={form.play_target} onChange={(e) => set('play_target', e.target.value)} />
            </Field>
            <Field label="Cover URL">
              <input className={inputClass} value={form.cover_url} onChange={(e) => set('cover_url', e.target.value)} />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                className={inputClass}
                value={form.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label="Intro HTML">
            <textarea className={inputClass} rows={2} value={form.intro_html} onChange={(e) => set('intro_html', e.target.value)} />
          </Field>
          <Field label="Marketing tags (comma-separated)">
            <input className={inputClass} value={form.marketing_tags} onChange={(e) => set('marketing_tags', e.target.value)} />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-600">Experiment materials</p>
              <button type="button" onClick={addMaterial} className="text-xs text-primary hover:underline">
                + Add file
              </button>
            </div>
            <div className="space-y-2">
              {form.materials.map((m, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    placeholder="File name"
                    value={m.file_name}
                    onChange={(e) => {
                      const materials = [...form.materials]
                      materials[i] = { ...materials[i], file_name: e.target.value }
                      setForm((f) => ({ ...f, materials }))
                    }}
                  />
                  <input
                    className={inputClass}
                    placeholder="File URL"
                    value={m.file_url}
                    onChange={(e) => {
                      const materials = [...form.materials]
                      materials[i] = { ...materials[i], file_url: e.target.value }
                      setForm((f) => ({ ...f, materials }))
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              {t('crud.cancel')}
            </button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
              {saving ? t('crud.saving') : t('crud.save')}
            </button>
          </div>
        </div>
      ) : null}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-sm">{t('crud.listHeading')}</div>
        {loading ? (
          <p className="p-4 text-sm text-slate-500">{t('crud.loading')}</p>
        ) : sorted.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">{t('crud.noItemsYet')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="p-3">Slug</th>
                  <th className="p-3">{t('crud.title')}</th>
                  <th className="p-3">Play</th>
                  <th className="p-3">{t('crud.status')}</th>
                  <th className="p-3">{t('crud.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-xs">{row.slug}</td>
                    <td className="p-3">{row.title}</td>
                    <td className="p-3 text-xs text-slate-500">
                      {row.playType}
                      {row.playTarget ? ` · ${row.playTarget}` : ''}
                    </td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(row)} className="text-xs text-primary hover:underline">
                          {t('crud.edit')}
                        </button>
                        <button type="button" onClick={() => remove(row.id)} className="text-xs text-red-600 hover:underline inline-flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          {t('crud.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
