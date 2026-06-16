import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../../lib/admin/db'
import {
  ensureCommunityPartnersSeeded,
  fallbackCommunityPartners,
  importCommunityPartnersDefaults,
} from '../../../lib/admin/communitySync'
import AdminField from '../../../components/admin/AdminField'
import AdminAlert from '../../../components/admin/AdminAlert'
import { CrudTable, inputClass } from '../../../components/admin/community/CommunityAdminCrud'
import { useAdminCrud } from '../../../hooks/useAdminCrud'

const emptyPartner = { name: '', region: '', type: '', sort_order: 0 }

export default function CommunityPartnersEditor() {
  const c = useAdminCrud()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [partners, setPartners] = useState([])
  const [usingFallback, setUsingFallback] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)
  const [formPartner, setFormPartner] = useState(emptyPartner)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error: loadError } = await supabase.from('community_partners').select('*').order('sort_order')
    if (loadError) {
      if (loadError.message.includes('does not exist')) {
        setPartners(fallbackCommunityPartners())
        setUsingFallback(true)
        setError(c.t('pages.community.partnersMigrationHint'))
        setLoading(false)
        return
      }
      throw loadError
    }

    if (data?.length) {
      setPartners(data)
      setUsingFallback(false)
    } else {
      setPartners(fallbackCommunityPartners())
      setUsingFallback(true)
    }
    setLoading(false)
  }, [c])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setError(null)
      try {
        const result = await ensureCommunityPartnersSeeded()
        if (cancelled) return
        if (result.seeded) {
          setSuccess(c.t('pages.community.partnersAutoImported', { count: result.count }))
        }
        await reload()
      } catch (e) {
        if (cancelled) return
        setError(e.message)
        setPartners(fallbackCommunityPartners())
        setUsingFallback(true)
        setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [reload, c])

  const resetForm = () => {
    setEditingPartner(null)
    setFormPartner(emptyPartner)
  }

  const syncToDatabase = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const result = await importCommunityPartnersDefaults()
      if (result.imported) {
        setSuccess(c.t('pages.community.partnersImported', { count: result.count }))
      } else if (result.reason === 'already_populated') {
        setSuccess(c.t('pages.community.partnersAlreadySynced'))
      }
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    setError(null)
    setSuccess(null)

    const name = formPartner.name?.trim()
    if (!name) {
      setError(c.t('pages.community.partnerNameRequired'))
      return
    }

    const payload = {
      name,
      region: formPartner.region?.trim() || '',
      type: formPartner.type?.trim() || '',
      sort_order: parseInt(formPartner.sort_order, 10) || 0,
    }

    setSaving(true)
    try {
      if (usingFallback) {
        await ensureCommunityPartnersSeeded()
      }

      if (editingPartner?.id && !String(editingPartner.id).startsWith('fallback-')) {
        await adminUpdate('community_partners', editingPartner.id, payload)
        setSuccess(c.t('pages.community.partnerUpdated'))
      } else if (editingPartner && String(editingPartner.id).startsWith('fallback-')) {
        const { data: match } = await supabase
          .from('community_partners')
          .select('id')
          .eq('sort_order', payload.sort_order)
          .maybeSingle()
        if (match?.id) {
          await adminUpdate('community_partners', match.id, payload)
          setSuccess(c.t('pages.community.partnerUpdated'))
        } else {
          await adminInsert('community_partners', payload)
          setSuccess(c.t('pages.community.partnerAdded'))
        }
      } else {
        await adminInsert('community_partners', payload)
        setSuccess(c.t('pages.community.partnerAdded'))
      }
      resetForm()
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (String(id).startsWith('fallback-')) return
    if (!confirm(c.t('pages.community.confirmDeletePartner'))) return
    setError(null)
    setSuccess(null)
    try {
      await adminDelete('community_partners', id)
      if (editingPartner?.id === id) resetForm()
      setSuccess(c.t('pages.community.partnerDeleted'))
      await reload()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEdit = (row) => {
    setError(null)
    setSuccess(null)
    setEditingPartner(row)
    setFormPartner({
      name: row.name || '',
      region: row.region || '',
      type: row.type || '',
      sort_order: row.sort_order ?? 0,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayCount = partners.length

  return (
    <div className="space-y-6">
      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      {usingFallback ? (
        <AdminAlert type="warning">
          <div className="space-y-2">
            <p>{c.t('pages.community.partnersUsingFallback')}</p>
            <button
              type="button"
              onClick={syncToDatabase}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-60"
            >
              {saving ? c.saving : c.t('pages.community.syncPartnersToDb')}
            </button>
          </div>
        </AdminAlert>
      ) : null}

      <div className="card p-6">
        <h2 className="font-semibold mb-1">
          {editingPartner ? c.editItem(c.t('pages.community.partnerItem')) : c.addItem(c.t('pages.community.partnerItem'))}
        </h2>
        <p className="text-xs text-slate-500 mb-4">{c.t('pages.community.partnerFormHint')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label={c.t('pages.community.institutionName')} required>
            <input
              className={inputClass}
              value={formPartner.name}
              onChange={(e) => setFormPartner((f) => ({ ...f, name: e.target.value }))}
              placeholder={c.t('pages.community.partnerNamePlaceholder')}
            />
          </AdminField>
          <AdminField label={c.t('pages.community.region')}>
            <input
              className={inputClass}
              value={formPartner.region}
              onChange={(e) => setFormPartner((f) => ({ ...f, region: e.target.value }))}
              placeholder={c.t('pages.community.partnerRegionPlaceholder')}
            />
          </AdminField>
          <AdminField label={c.t('pages.community.institutionType')}>
            <input
              className={inputClass}
              value={formPartner.type}
              onChange={(e) => setFormPartner((f) => ({ ...f, type: e.target.value }))}
              placeholder={c.t('pages.community.partnerTypePlaceholder')}
            />
          </AdminField>
          <AdminField label={c.t('pages.community.sortOrder')}>
            <input
              type="number"
              className={inputClass}
              value={formPartner.sort_order}
              onChange={(e) => setFormPartner((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
            />
          </AdminField>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            {saving ? c.saving : c.save}
          </button>
          {editingPartner ? (
            <button type="button" onClick={resetForm} disabled={saving} className="px-5 py-2 border rounded-xl text-sm">
              {c.cancel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold">{c.t('pages.community.partnersList')}</div>
            <p className="text-xs text-slate-500 mt-0.5">{c.t('pages.community.partnersListHint')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {c.t('pages.community.partnersCount', { count: displayCount })}
            </span>
            {usingFallback ? (
              <button
                type="button"
                onClick={syncToDatabase}
                disabled={saving || loading}
                className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-60"
              >
                {c.t('pages.community.syncPartnersToDb')}
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">{c.loading}</div>
        ) : partners.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-3">
            <p>{c.t('pages.community.noPartners')}</p>
          </div>
        ) : (
          <>
            <CrudTable
              columns={[
                {
                  key: 'name',
                  label: c.t('pages.community.institutionName'),
                  render: (row) => (
                    <span className="flex items-center gap-2">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                        {row.name?.charAt(0) || '?'}
                      </span>
                      <span className="truncate">{row.name}</span>
                      {String(row.id).startsWith('fallback-') ? (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{c.t('pages.community.partnerFallbackBadge')}</span>
                      ) : null}
                    </span>
                  ),
                },
                { key: 'region', label: c.t('pages.community.region') },
                { key: 'type', label: c.t('pages.community.institutionType') },
                { key: 'sort_order', label: c.t('pages.community.sortOrder') },
              ]}
              rows={partners}
              onEdit={startEdit}
              onDelete={remove}
              editLabel={c.edit}
              deleteLabel={c.delete}
              empty={c.t('pages.community.noPartners')}
            />

            <div className="p-4 border-t bg-slate-50/80">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-3">
                {c.t('pages.community.partnersPreview')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {partners.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-primary/70 mb-1.5">
                      {p.name?.charAt(0)}
                    </div>
                    <div className="text-[10px] font-medium text-bingo-dark leading-tight line-clamp-2">{p.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 truncate">{p.region}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
