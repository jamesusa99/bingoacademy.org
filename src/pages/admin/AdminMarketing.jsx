import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const DEFAULT_MIN_PURCHASE_CENTS = 100

function liveStatusLabel(live, p) {
  const key = `liveStatus_${live}`
  const label = p(key)
  return label === key ? live : label
}

function emptyForm() {
  return {
    code: '',
    name: '',
    description: '',
    discount_type: 'percent',
    discount_percent: '15',
    discount_amount_cents: '',
    currency: 'usd',
    starts_at: '',
    ends_at: '',
    max_redemptions: '',
    min_purchase_cents: String(DEFAULT_MIN_PURCHASE_CENTS),
    applies_to: 'all',
    applicable_slugs: '[]',
    status: 'draft',
    stripe_coupon_id: '',
    internal_notes: '',
    sort_order: '0',
  }
}

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value) {
  if (!value?.trim()) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function formatDiscount(row, p) {
  if (row.discount_type === 'fixed_amount') {
    const cents = row.discount_amount_cents ?? 0
    return `$${(cents / 100).toFixed(2)}`
  }
  return p('discountPercent', { n: row.discount_percent ?? 0 })
}

function effectiveStatus(row, now = Date.now()) {
  if (row.status === 'paused' || row.status === 'draft') return row.status
  if (row.ends_at && new Date(row.ends_at).getTime() < now) return 'expired'
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return 'scheduled'
  if (row.max_redemptions != null && row.redemption_count >= row.max_redemptions) return 'exhausted'
  return row.status
}

function statusBadgeClass(status) {
  const map = {
    active: 'bg-emerald-100 text-emerald-800',
    draft: 'bg-slate-100 text-slate-600',
    paused: 'bg-amber-100 text-amber-800',
    expired: 'bg-red-100 text-red-700',
    scheduled: 'bg-sky-100 text-sky-800',
    exhausted: 'bg-orange-100 text-orange-800',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
}

export default function AdminMarketing() {
  const c = useAdminCrud()
  const p = (key, vars) => c.t(`pages.marketing.${key}`, vars)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: qErr } = await supabase
      .from('promo_codes')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (qErr) {
      setError(qErr.message)
      setItems([])
      setLoading(false)
      return
    }

    let rows = data || []
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('metadata, stripe_checkout_session_id')
        .eq('status', 'paid')
        .limit(2000)

      const seen = new Set()
      const counts = {}
      for (const order of orders || []) {
        const promoId = order.metadata?.promo_code_id
        const sessionId = order.stripe_checkout_session_id
        if (!promoId || !sessionId || seen.has(sessionId)) continue
        seen.add(sessionId)
        counts[promoId] = (counts[promoId] || 0) + 1
      }

      rows = await Promise.all(
        rows.map(async (row) => {
          const fromOrders = counts[row.id] || 0
          if (fromOrders <= (row.redemption_count ?? 0)) return row
          try {
            await adminUpdate('promo_codes', row.id, { redemption_count: fromOrders })
            return { ...row, redemption_count: fromOrders }
          } catch {
            return { ...row, redemption_count: fromOrders }
          }
        })
      )
    } catch {
      /* order backfill is best-effort */
    }

    setItems(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const stats = useMemo(() => {
    const now = Date.now()
    return {
      total: items.length,
      active: items.filter((row) => effectiveStatus(row, now) === 'active').length,
      scheduled: items.filter((row) => effectiveStatus(row, now) === 'scheduled').length,
    }
  }, [items])

  const toPayload = () => {
    let slugs = []
    try {
      slugs = form.applicable_slugs?.trim() ? JSON.parse(form.applicable_slugs) : []
      if (!Array.isArray(slugs)) throw new Error('applicable_slugs must be array')
    } catch {
      throw new Error(p('jsonSlugsError'))
    }

    const code = form.code.trim().toUpperCase()
    if (!code) throw new Error(p('codeRequired'))
    if (!form.name.trim()) throw new Error(p('nameRequired'))

    const discountType = form.discount_type
    const discountPercent =
      discountType === 'percent' ? parseInt(form.discount_percent, 10) : null
    const discountAmountCents =
      discountType === 'fixed_amount' ? parseInt(form.discount_amount_cents, 10) : null

    if (discountType === 'percent' && (Number.isNaN(discountPercent) || discountPercent < 1)) {
      throw new Error(p('percentRequired'))
    }
    if (discountType === 'fixed_amount' && (Number.isNaN(discountAmountCents) || discountAmountCents < 1)) {
      throw new Error(p('amountRequired'))
    }

    return {
      code,
      name: form.name.trim(),
      description: form.description?.trim() || null,
      discount_type: discountType,
      discount_percent: discountPercent,
      discount_amount_cents: discountAmountCents,
      currency: (form.currency || 'usd').toLowerCase(),
      starts_at: fromDatetimeLocal(form.starts_at),
      ends_at: fromDatetimeLocal(form.ends_at),
      max_redemptions: form.max_redemptions ? parseInt(form.max_redemptions, 10) : null,
      min_purchase_cents: form.min_purchase_cents?.trim()
        ? parseInt(form.min_purchase_cents, 10)
        : DEFAULT_MIN_PURCHASE_CENTS,
      applies_to: form.applies_to,
      applicable_slugs: slugs,
      status: form.status,
      stripe_coupon_id: form.stripe_coupon_id?.trim() || null,
      internal_notes: form.internal_notes?.trim() || null,
      sort_order: parseInt(form.sort_order, 10) || 0,
      updated_at: new Date().toISOString(),
    }
  }

  const startEdit = (row) => {
    setEditing(row)
    setForm({
      code: row.code || '',
      name: row.name || '',
      description: row.description || '',
      discount_type: row.discount_type || 'percent',
      discount_percent: row.discount_percent != null ? String(row.discount_percent) : '',
      discount_amount_cents: row.discount_amount_cents != null ? String(row.discount_amount_cents) : '',
      currency: row.currency || 'usd',
      starts_at: toDatetimeLocal(row.starts_at),
      ends_at: toDatetimeLocal(row.ends_at),
      max_redemptions: row.max_redemptions != null ? String(row.max_redemptions) : '',
      min_purchase_cents: row.min_purchase_cents != null ? String(row.min_purchase_cents) : String(DEFAULT_MIN_PURCHASE_CENTS),
      applies_to: row.applies_to || 'all',
      applicable_slugs: JSON.stringify(row.applicable_slugs || [], null, 2),
      status: row.status || 'draft',
      stripe_coupon_id: row.stripe_coupon_id || '',
      internal_notes: row.internal_notes || '',
      sort_order: String(row.sort_order ?? 0),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditing(null)
    setForm(emptyForm())
  }

  const save = async () => {
    setError(null)
    let payload
    try {
      payload = toPayload()
    } catch (err) {
      setError(err.message)
      return
    }
    try {
      if (editing) {
        await adminUpdate('promo_codes', editing.id, payload)
      } else {
        await adminInsert('promo_codes', payload)
      }
      resetForm()
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const del = async (id) => {
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    try {
      await adminDelete('promo_codes', id)
      if (editing?.id === id) resetForm()
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const duplicate = (row) => {
    setEditing(null)
    setForm({
      ...emptyForm(),
      name: `${row.name} (copy)`,
      description: row.description || '',
      discount_type: row.discount_type,
      discount_percent: row.discount_percent != null ? String(row.discount_percent) : '15',
      discount_amount_cents: row.discount_amount_cents != null ? String(row.discount_amount_cents) : '',
      currency: row.currency || 'usd',
      max_redemptions: row.max_redemptions != null ? String(row.max_redemptions) : '',
      min_purchase_cents: row.min_purchase_cents != null ? String(row.min_purchase_cents) : String(DEFAULT_MIN_PURCHASE_CENTS),
      applies_to: row.applies_to || 'all',
      applicable_slugs: JSON.stringify(row.applicable_slugs || [], null, 2),
      status: 'draft',
      internal_notes: row.internal_notes || '',
      sort_order: String(row.sort_order ?? 0),
    })
  }

  return (
    <div>
      <AdminPageHeader titleKey="pages.marketing.title" descriptionKey="pages.marketing.desc" />

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: p('statTotal'), value: stats.total },
          { label: p('statActive'), value: stats.active },
          { label: p('statScheduled'), value: stats.scheduled },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-bingo-dark mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-1">
          {editing ? p('editPromo') : p('addPromo')}
        </h2>
        <p className="text-xs text-slate-500 mb-4">{p('formHint')}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label={p('fieldCode')} required>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="BINGO2026"
              className="w-full rounded-xl border px-3 py-2 text-sm font-mono uppercase"
            />
          </AdminField>
          <AdminField label={p('fieldName')} required>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
          <AdminField label={p('fieldDescription')} className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
          <AdminField label={p('fieldDiscountType')}>
            <select
              value={form.discount_type}
              onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="percent">{p('discountTypePercent')}</option>
              <option value="fixed_amount">{p('discountTypeFixed')}</option>
            </select>
          </AdminField>
          <AdminField label={p('fieldStatus')}>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="draft">{p('statusDraft')}</option>
              <option value="active">{p('statusActive')}</option>
              <option value="paused">{p('statusPaused')}</option>
              <option value="expired">{p('statusExpired')}</option>
            </select>
          </AdminField>
          {form.discount_type === 'percent' ? (
            <AdminField label={p('fieldDiscountPercent')} required>
              <input
                type="number"
                min={1}
                max={100}
                value={form.discount_percent}
                onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </AdminField>
          ) : (
            <AdminField label={p('fieldDiscountAmount')} required>
              <input
                type="number"
                min={1}
                value={form.discount_amount_cents}
                onChange={(e) => setForm((f) => ({ ...f, discount_amount_cents: e.target.value }))}
                placeholder="1500 = $15.00"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </AdminField>
          )}
          <AdminField label={p('fieldCurrency')}>
            <input
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
          <AdminField label={p('fieldStartsAt')}>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
          <AdminField label={p('fieldEndsAt')}>
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
          <AdminField label={p('fieldMaxRedemptions')}>
            <input
              type="number"
              min={0}
              value={form.max_redemptions}
              onChange={(e) => setForm((f) => ({ ...f, max_redemptions: e.target.value }))}
              placeholder={p('unlimitedPlaceholder')}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
          <AdminField label={p('fieldMinPurchase')}>
            <input
              type="number"
              min={0}
              value={form.min_purchase_cents}
              onChange={(e) => setForm((f) => ({ ...f, min_purchase_cents: e.target.value }))}
              placeholder={p('minPurchaseHint')}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">{p('minCheckoutRule')}</p>
          </AdminField>
          <AdminField label={p('fieldAppliesTo')}>
            <select
              value={form.applies_to}
              onChange={(e) => setForm((f) => ({ ...f, applies_to: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              <option value="all">{p('scopeAll')}</option>
              <option value="ioai">{p('scopeIoai')}</option>
              <option value="courses">{p('scopeCourses')}</option>
              <option value="mall">{p('scopeMall')}</option>
            </select>
          </AdminField>
          <AdminField label={p('fieldSortOrder')}>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
          <AdminField label={p('fieldStripeCoupon')} className="sm:col-span-2">
            <input
              value={form.stripe_coupon_id}
              onChange={(e) => setForm((f) => ({ ...f, stripe_coupon_id: e.target.value }))}
              placeholder="coupon_… (optional)"
              className="w-full rounded-xl border px-3 py-2 text-sm font-mono"
            />
          </AdminField>
          <AdminField label={p('fieldApplicableSlugs')} className="sm:col-span-2">
            <textarea
              value={form.applicable_slugs}
              onChange={(e) => setForm((f) => ({ ...f, applicable_slugs: e.target.value }))}
              rows={3}
              placeholder='["ioai-competition-system"]'
              className="w-full rounded-xl border px-3 py-2 text-sm font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">{p('slugsHint')}</p>
          </AdminField>
          <AdminField label={p('fieldNotes')} className="sm:col-span-2">
            <textarea
              value={form.internal_notes}
              onChange={(e) => setForm((f) => ({ ...f, internal_notes: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">
            {c.save}
          </button>
          {editing ? (
            <button type="button" onClick={resetForm} className="px-5 py-2 border rounded-xl text-sm">
              {c.cancel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold text-bingo-dark">{p('listTitle')}</div>
        {loading ? (
          <p className="p-8 text-center text-slate-500 text-sm">{c.loading}</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-500 text-sm">{p('emptyList')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">{p('colCode')}</th>
                  <th className="p-3">{p('colName')}</th>
                  <th className="p-3">{p('colDiscount')}</th>
                  <th className="p-3">{p('colValidity')}</th>
                  <th className="p-3">{p('colScope')}</th>
                  <th className="p-3">{p('colUsage')}</th>
                  <th className="p-3">{p('colStatus')}</th>
                  <th className="p-3">{c.actions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const live = effectiveStatus(row)
                  return (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="p-3 font-mono font-semibold text-primary">{row.code}</td>
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{formatDiscount(row, p)}</td>
                      <td className="p-3 text-xs text-slate-600">
                        {row.starts_at ? new Date(row.starts_at).toLocaleString() : '—'}
                        <br />
                        {row.ends_at ? new Date(row.ends_at).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-xs">{row.applies_to}</td>
                      <td className="p-3 text-xs">
                        {row.redemption_count ?? 0}
                        {row.max_redemptions != null ? ` / ${row.max_redemptions}` : ''}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeClass(live)}`}>
                          {liveStatusLabel(live, p)}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <button type="button" onClick={() => startEdit(row)} className="text-primary mr-2">
                          {c.edit}
                        </button>
                        <button type="button" onClick={() => duplicate(row)} className="text-slate-600 mr-2">
                          {p('duplicate')}
                        </button>
                        <button type="button" onClick={() => del(row.id)} className="text-red-600">
                          {c.delete}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
