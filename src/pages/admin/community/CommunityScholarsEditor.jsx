import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../../lib/admin/db'
import AdminField from '../../../components/admin/AdminField'
import { CrudTable, inputClass, textareaClass } from '../../../components/admin/community/CommunityAdminCrud'
import { useAdminCrud } from '../../../hooks/useAdminCrud'

export default function CommunityScholarsEditor() {
  const c = useAdminCrud()
  const [scholarSub, setScholarSub] = useState('students')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [tiers, setTiers] = useState([])
  const [scholars, setScholars] = useState([])

  const [editingTier, setEditingTier] = useState(null)
  const [editingScholar, setEditingScholar] = useState(null)

  const emptyTier = { slug: '', label: '', age: '', description: '', focus: '', pts: 100, color: 'bg-green-100 text-green-700 border-green-200', icon: '🌱', is_highest: false, sort_order: 0 }
  const emptyScholar = { name: '', grade: '', tier_slug: 'pioneer', achievement: '', path: '', avatar: '⭐', pts: 0, sort_order: 0 }

  const [formTier, setFormTier] = useState(emptyTier)
  const [formScholar, setFormScholar] = useState(emptyScholar)

  const tierOptions = useMemo(() => tiers.map((t) => ({ value: t.slug, label: t.label })), [tiers])

  const reload = useCallback(async () => {
    setLoading(true)
    const [tiersRes, scholarsRes] = await Promise.all([
      supabase.from('community_scholar_tiers').select('*').order('sort_order'),
      supabase.from('community_scholars').select('*').order('sort_order'),
    ])
    setTiers(tiersRes.data || [])
    setScholars(scholarsRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload().catch((e) => setError(e.message))
  }, [reload])

  const save = async (table, editing, form, resetForm, clearEditing, normalize) => {
    setError(null)
    const payload = normalize(form)
    try {
      if (editing) {
        await adminUpdate(table, editing.id, payload)
        clearEditing(null)
        resetForm()
      } else {
        await adminInsert(table, payload)
        resetForm()
      }
      await reload()
    } catch (e) {
      setError(e.message)
    }
  }

  const remove = async (table, id, confirmKey) => {
    if (!confirm(c.t(confirmKey))) return
    setError(null)
    try {
      await adminDelete(table, id)
      await reload()
    } catch (e) {
      setError(e.message)
    }
  }

  const subBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setScholarSub(id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${scholarSub === id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6">
      {error ? <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div> : null}

      <div className="flex gap-2">
        {subBtn('students', c.t('pages.community.scholarsTab'))}
        {subBtn('tiers', c.t('pages.community.tiersTab'))}
      </div>

      {scholarSub === 'tiers' ? (
        <>
          <div className="card p-6">
            <h2 className="font-semibold mb-4">{editingTier ? c.editItem(c.t('pages.community.tierItem')) : c.addItem(c.t('pages.community.tierItem'))}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label={c.t('pages.community.slug')} required>
                <input className={inputClass} value={formTier.slug} disabled={Boolean(editingTier)} onChange={(e) => setFormTier((f) => ({ ...f, slug: e.target.value }))} placeholder="pioneer" />
              </AdminField>
              <AdminField label={c.title} required>
                <input className={inputClass} value={formTier.label} onChange={(e) => setFormTier((f) => ({ ...f, label: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.age')}>
                <input className={inputClass} value={formTier.age} onChange={(e) => setFormTier((f) => ({ ...f, age: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.pts')}>
                <input type="number" className={inputClass} value={formTier.pts} onChange={(e) => setFormTier((f) => ({ ...f, pts: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.icon')}>
                <input className={inputClass} value={formTier.icon} onChange={(e) => setFormTier((f) => ({ ...f, icon: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.colorClasses')}>
                <input className={inputClass} value={formTier.color} onChange={(e) => setFormTier((f) => ({ ...f, color: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.sortOrder')}>
                <input type="number" className={inputClass} value={formTier.sort_order} onChange={(e) => setFormTier((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.highestTier')} className="flex items-end">
                <label className="flex items-center gap-2 text-sm pb-2">
                  <input type="checkbox" checked={formTier.is_highest} onChange={(e) => setFormTier((f) => ({ ...f, is_highest: e.target.checked }))} />
                  {c.t('pages.community.highestTierHint')}
                </label>
              </AdminField>
              <AdminField label={c.t('pages.community.description')} className="sm:col-span-2">
                <input className={inputClass} value={formTier.description} onChange={(e) => setFormTier((f) => ({ ...f, description: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.focus')} className="sm:col-span-2">
                <textarea className={textareaClass} value={formTier.focus} onChange={(e) => setFormTier((f) => ({ ...f, focus: e.target.value }))} />
              </AdminField>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => save('community_scholar_tiers', editingTier, formTier, () => setFormTier(emptyTier), setEditingTier, (f) => ({ ...f, pts: parseInt(f.pts, 10) || 0, sort_order: parseInt(f.sort_order, 10) || 0 }))} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
              {editingTier ? <button type="button" onClick={() => { setEditingTier(null); setFormTier(emptyTier) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button> : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">{c.t('pages.community.tiersList')}</div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : (
              <CrudTable
                columns={[
                  { key: 'label', label: c.title },
                  { key: 'slug', label: c.t('pages.community.slug') },
                  { key: 'pts', label: c.t('pages.community.pts') },
                ]}
                rows={tiers}
                onEdit={(row) => { setEditingTier(row); setFormTier({ ...row, pts: row.pts ?? 0, sort_order: row.sort_order ?? 0 }) }}
                onDelete={(id) => remove('community_scholar_tiers', id, 'pages.community.confirmDeleteTier')}
                editLabel={c.edit}
                deleteLabel={c.delete}
                empty={c.t('pages.community.noTiers')}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div className="card p-6">
            <h2 className="font-semibold mb-4">{editingScholar ? c.editItem(c.t('pages.community.scholarItem')) : c.addItem(c.t('pages.community.scholarItem'))}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label={c.t('pages.community.studentName')} required>
                <input className={inputClass} value={formScholar.name} onChange={(e) => setFormScholar((f) => ({ ...f, name: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.grade')}>
                <input className={inputClass} value={formScholar.grade} onChange={(e) => setFormScholar((f) => ({ ...f, grade: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.tierSlug')} required>
                <select className={inputClass} value={formScholar.tier_slug} onChange={(e) => setFormScholar((f) => ({ ...f, tier_slug: e.target.value }))}>
                  {tierOptions.length ? tierOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>) : (
                    <>
                      <option value="pioneer">Pioneer</option>
                      <option value="rising">Rising</option>
                      <option value="elite">Elite</option>
                      <option value="super">Super</option>
                    </>
                  )}
                </select>
              </AdminField>
              <AdminField label={c.t('pages.community.pts')}>
                <input type="number" className={inputClass} value={formScholar.pts} onChange={(e) => setFormScholar((f) => ({ ...f, pts: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.avatar')}>
                <input className={inputClass} value={formScholar.avatar} onChange={(e) => setFormScholar((f) => ({ ...f, avatar: e.target.value }))} placeholder="⭐" />
              </AdminField>
              <AdminField label={c.t('pages.community.sortOrder')}>
                <input type="number" className={inputClass} value={formScholar.sort_order} onChange={(e) => setFormScholar((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.achievement')} className="sm:col-span-2">
                <input className={inputClass} value={formScholar.achievement} onChange={(e) => setFormScholar((f) => ({ ...f, achievement: e.target.value }))} />
              </AdminField>
              <AdminField label={c.t('pages.community.path')} className="sm:col-span-2">
                <textarea className={textareaClass} value={formScholar.path} onChange={(e) => setFormScholar((f) => ({ ...f, path: e.target.value }))} />
              </AdminField>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => save('community_scholars', editingScholar, formScholar, () => setFormScholar(emptyScholar), setEditingScholar, (f) => ({ ...f, pts: parseInt(f.pts, 10) || 0, sort_order: parseInt(f.sort_order, 10) || 0 }))} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
              {editingScholar ? <button type="button" onClick={() => { setEditingScholar(null); setFormScholar(emptyScholar) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button> : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">{c.t('pages.community.scholarsList')}</div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : (
              <CrudTable
                columns={[
                  { key: 'name', label: c.t('pages.community.studentName') },
                  { key: 'tier_slug', label: c.t('pages.community.tierSlug') },
                  { key: 'pts', label: c.t('pages.community.pts') },
                  { key: 'achievement', label: c.t('pages.community.achievement') },
                ]}
                rows={scholars}
                onEdit={(row) => { setEditingScholar(row); setFormScholar({ ...row, pts: row.pts ?? 0, sort_order: row.sort_order ?? 0 }) }}
                onDelete={(id) => remove('community_scholars', id, 'pages.community.confirmDeleteScholar')}
                editLabel={c.edit}
                deleteLabel={c.delete}
                empty={c.t('pages.community.noScholars')}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
