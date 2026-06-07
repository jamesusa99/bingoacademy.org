import { useCallback, useEffect, useMemo, useState } from 'react'
import { Package, Plus, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import {
  adminDeleteLabPack,
  adminFetchExperiments,
  adminFetchLabPack,
  adminFetchLabPacks,
  adminSaveLabPack,
} from '../../lib/ioaiExperimentsClient'
import { fetchCurriculumAdmin } from '../../lib/ioaiCurriculumAdmin'

const EMPTY = {
  slug: '',
  title: '',
  cover_url: '',
  intro_html: '',
  price_cents: '',
  compare_at_cents: '',
  currency: 'usd',
  status: 'live',
  sort_order: 0,
  marketing_tags: '',
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

export default function AdminIoaiLabPacks() {
  const c = useAdminCrud()
  const t = c.t
  const [packs, setPacks] = useState([])
  const [experiments, setExperiments] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingSlug, setEditingSlug] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [packId, setPackId] = useState(null)
  const [selectedExperiments, setSelectedExperiments] = useState(new Set())
  const [selectedModules, setSelectedModules] = useState(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ packs: packRows }, { experiments: expRows }, levels] = await Promise.all([
        adminFetchLabPacks(),
        adminFetchExperiments(),
        fetchCurriculumAdmin('ioai'),
      ])
      setPacks(packRows || [])
      setExperiments(expRows || [])
      const modList = []
      for (const level of levels || []) {
        for (const theme of level.themes || []) {
          for (const mod of theme.modules || []) {
            modList.push({ id: mod.id, title: mod.title, catalogSlug: mod.catalog_slug })
          }
        }
      }
      setModules(modList)
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

  const startNew = () => {
    setEditingSlug('new')
    setPackId(null)
    setForm(EMPTY)
    setSelectedExperiments(new Set())
    setSelectedModules(new Set())
    setSuccess(null)
  }

  const startEdit = async (slug) => {
    setError(null)
    try {
      const detail = await adminFetchLabPack(slug)
      const p = detail.pack
      setEditingSlug(slug)
      setPackId(p.id)
      setForm({
        slug: p.slug || '',
        title: p.title || '',
        cover_url: p.cover_url || '',
        intro_html: p.intro_html || '',
        price_cents: p.price_cents ?? '',
        compare_at_cents: p.compare_at_cents ?? '',
        currency: p.currency || 'usd',
        status: p.status || 'live',
        sort_order: p.sort_order ?? 0,
        marketing_tags: (p.marketing_tags || []).join(', '),
      })
      setSelectedExperiments(new Set(detail.experimentIds || []))
      setSelectedModules(new Set(detail.recommendedModuleIds || []))
      setSuccess(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleSet = (setFn, id) => {
    setFn((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await adminSaveLabPack({
        pack: {
          id: packId,
          slug: form.slug.trim(),
          title: form.title.trim(),
          cover_url: form.cover_url.trim() || null,
          intro_html: form.intro_html.trim() || null,
          price_cents: parseInt(form.price_cents, 10) || 0,
          compare_at_cents: form.compare_at_cents !== '' ? parseInt(form.compare_at_cents, 10) : null,
          currency: form.currency || 'usd',
          status: form.status,
          sort_order: parseInt(form.sort_order, 10) || 0,
          marketing_tags: form.marketing_tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        experimentIds: [...selectedExperiments],
        recommendedModuleIds: [...selectedModules],
      })
      setSuccess('Lab pack saved.')
      setEditingSlug(null)
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
      await adminDeleteLabPack(id)
      if (packId === id) setEditingSlug(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const sortedPacks = useMemo(
    () => [...packs].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [packs]
  )

  return (
    <div>
      <AdminPageHeader
        title="IOAI Lab Packs"
        desc="Standalone experiment bundles — sold separately from L3 modules."
        icon={<Package className="w-5 h-5" />}
      />

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <button type="button" onClick={startNew} className="btn-primary text-sm px-4 py-2 mb-4 inline-flex items-center gap-1.5">
        <Plus className="w-4 h-4" />
        {t('crud.addNew')}
      </button>

      {editingSlug ? (
        <div className="card p-5 mb-6 border-2 border-primary/20 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Slug">
              <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
            </Field>
            <Field label={t('crud.title')}>
              <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Price (cents)">
              <input className={inputClass} value={form.price_cents} onChange={(e) => set('price_cents', e.target.value)} />
            </Field>
            <Field label={t('crud.status')}>
              <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="live">live</option>
                <option value="draft">draft</option>
                <option value="hidden">hidden</option>
              </select>
            </Field>
            <Field label="Cover URL">
              <input className={inputClass} value={form.cover_url} onChange={(e) => set('cover_url', e.target.value)} />
            </Field>
            <Field label="Sort order">
              <input type="number" className={inputClass} value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
            </Field>
          </div>
          <Field label="Intro">
            <textarea className={inputClass} rows={2} value={form.intro_html} onChange={(e) => set('intro_html', e.target.value)} />
          </Field>

          <Field label="Experiments in pack">
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-1">
              {experiments.map((exp) => (
                <label key={exp.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedExperiments.has(exp.id)}
                    onChange={() => toggleSet(setSelectedExperiments, exp.id)}
                  />
                  <span>{exp.title}</span>
                  <span className="text-xs text-slate-400 font-mono">{exp.slug}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Recommended L3 modules (optional)">
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-1">
              {modules.map((mod) => (
                <label key={mod.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedModules.has(mod.id)}
                    onChange={() => toggleSet(setSelectedModules, mod.id)}
                  />
                  <span>{mod.title}</span>
                  <span className="text-xs text-slate-400 font-mono">{mod.catalogSlug}</span>
                </label>
              ))}
            </div>
          </Field>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setEditingSlug(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              {t('crud.cancel')}
            </button>
            <button type="button" disabled={saving} onClick={save} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
              {saving ? t('crud.saving') : t('crud.save')}
            </button>
          </div>
        </div>
      ) : null}

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">{t('crud.loading')}</p>
        ) : sortedPacks.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">{t('crud.noItemsYet')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="p-3">Slug</th>
                <th className="p-3">{t('crud.title')}</th>
                <th className="p-3">{t('crud.price')}</th>
                <th className="p-3">{t('crud.status')}</th>
                <th className="p-3">{t('crud.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedPacks.map((row) => (
                <tr key={row.id} className="border-b border-slate-50">
                  <td className="p-3 font-mono text-xs">{row.slug}</td>
                  <td className="p-3">{row.title}</td>
                  <td className="p-3">${((row.price_cents || 0) / 100).toFixed(2)}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(row.slug)} className="text-xs text-primary hover:underline">
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
        )}
      </div>
    </div>
  )
}
