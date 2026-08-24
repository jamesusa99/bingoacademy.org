import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import {
  addAdminChannelMember,
  createAdminChannel,
  deleteAdminChannel,
  fetchAdminChannelPolicy,
  fetchAdminChannels,
  removeAdminChannelMember,
  saveAdminChannelPolicy,
  updateAdminChannel,
} from '../../lib/channelsApi'
import { channelSharePath } from '../../lib/channelReferral'

function emptyForm() {
  return {
    name: '',
    slug: '',
    code: '',
    kind: 'partner',
    status: 'draft',
    commissionPercent: '15',
    minPayoutDollars: '100',
    holdDays: '7',
    contactName: '',
    contactEmail: '',
    description: '',
    notes: '',
  }
}

function formatMoney(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(
    (cents || 0) / 100
  )
}

function formFromChannel(channel) {
  return {
    name: channel.name || '',
    slug: channel.slug || '',
    code: channel.code || '',
    kind: channel.kind || 'partner',
    status: channel.status || 'draft',
    commissionPercent: String((channel.commissionBps || 0) / 100),
    minPayoutDollars: String((channel.minPayoutCents || 0) / 100),
    holdDays: String(channel.holdDays ?? 7),
    contactName: channel.contactName || '',
    contactEmail: channel.contactEmail || '',
    description: channel.description || '',
    notes: channel.notes || '',
  }
}

export default function AdminChannels() {
  const c = useAdminCrud()
  const p = (key, vars) => c.t(`pages.channels.${key}`, vars)
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState('manager')
  const [policy, setPolicy] = useState({ commissionPercent: '10', holdDays: '7', minPayoutDollars: '100' })
  const [policySaving, setPolicySaving] = useState(false)
  const [kindFilter, setKindFilter] = useState('managed')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminChannels()
      setChannels(data.channels || [])
    } catch (err) {
      setError(err.message)
      setChannels([])
    }
    try {
      const policyData = await fetchAdminChannelPolicy()
      if (policyData?.policy) {
        setPolicy({
          commissionPercent: String(policyData.policy.commissionPercent),
          holdDays: String(policyData.policy.holdDays),
          minPayoutDollars: String(policyData.policy.minPayoutDollars),
        })
      }
    } catch {
      /* keep fallback defaults until the policy API is available */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const editing = channels.find((row) => row.id === editingId) || null

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setSuccess(null)
  }

  const startEdit = (channel) => {
    setEditingId(channel.id)
    setForm(formFromChannel(channel))
    setSuccess(null)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    const payload = {
      name: form.name,
      slug: form.slug,
      code: form.code,
      kind: form.kind,
      status: form.status,
      commissionPercent: Number(form.commissionPercent),
      minPayoutDollars: Number(form.minPayoutDollars),
      holdDays: Number(form.holdDays),
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      description: form.description,
      notes: form.notes,
    }
    try {
      if (editingId) await updateAdminChannel(editingId, payload)
      else {
        const created = await createAdminChannel(payload)
        setEditingId(created.channel?.id || null)
      }
      setSuccess(p('saved'))
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const savePolicy = async (e) => {
    e.preventDefault()
    setPolicySaving(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await saveAdminChannelPolicy({
        commissionPercent: Number(policy.commissionPercent),
        holdDays: Number(policy.holdDays),
        minPayoutDollars: Number(policy.minPayoutDollars),
      })
      if (result?.policy) {
        setPolicy({
          commissionPercent: String(result.policy.commissionPercent),
          holdDays: String(result.policy.holdDays),
          minPayoutDollars: String(result.policy.minPayoutDollars),
        })
      }
      setSuccess(p('policySaved', { n: result.updated ?? 0 }))
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setPolicySaving(false)
    }
  }

  const remove = async (channel) => {
    if (!window.confirm(c.confirmDelete(channel.name))) return
    try {
      await deleteAdminChannel(channel.id)
      if (editingId === channel.id) startCreate()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const addMemberFromEmail = async (email) => {
    const trimmed = String(email || '').trim()
    if (!editingId || !trimmed) return
    try {
      await addAdminChannelMember(editingId, { email: trimmed, role: memberRole })
      setMemberEmail('')
      setError(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const addMember = async (e) => {
    e.preventDefault()
    await addMemberFromEmail(memberEmail)
  }

  const contactEmailNorm = form.contactEmail.trim().toLowerCase()
  const contactNeedsMembership = Boolean(
    editing &&
      contactEmailNorm &&
      !(editing.members || []).some((member) => (member.email || '').trim().toLowerCase() === contactEmailNorm)
  )

  const removeMember = async (userId) => {
    if (!editingId) return
    try {
      await removeAdminChannelMember(editingId, userId)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const shareUrl = editing ? `${window.location.origin}${channelSharePath(editing.code)}` : ''
  const visibleChannels = channels.filter((channel) => {
    if (kindFilter === 'personal') return channel.kind === 'personal' || String(channel.slug || '').startsWith('user-')
    if (kindFilter === 'managed') return channel.kind !== 'personal' && !String(channel.slug || '').startsWith('user-')
    return true
  })

  return (
    <div>
      <AdminPageHeader titleKey="pages.channels.title" descriptionKey="pages.channels.desc" />
      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <form onSubmit={savePolicy} className="card p-5 mb-6 space-y-3">
        <div>
          <h2 className="font-semibold text-bingo-dark">{p('policyTitle')}</h2>
          <p className="text-sm text-slate-600 mt-1">{p('policyDesc')}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <AdminField label={p('fieldRate')} required>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input w-full"
              value={policy.commissionPercent}
              onChange={(e) => setPolicy({ ...policy, commissionPercent: e.target.value })}
            />
          </AdminField>
          <AdminField label={p('fieldHoldDays')} required>
            <input
              type="number"
              min="0"
              max="365"
              className="input w-full"
              value={policy.holdDays}
              onChange={(e) => setPolicy({ ...policy, holdDays: e.target.value })}
            />
          </AdminField>
          <AdminField label={p('fieldMinPayout')} required>
            <input
              type="number"
              min="0"
              step="1"
              className="input w-full"
              value={policy.minPayoutDollars}
              onChange={(e) => setPolicy({ ...policy, minPayoutDollars: e.target.value })}
            />
          </AdminField>
        </div>
        <button type="submit" disabled={policySaving} className="btn-primary px-4 py-2.5 text-sm disabled:opacity-60">
          {policySaving ? c.saving : p('policySave')}
        </button>
      </form>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] gap-6">
        <div className="card overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
            <h2 className="font-semibold text-bingo-dark">{p('listTitle')}</h2>
            <div className="flex items-center gap-2">
              {[
                ['managed', p('filterManaged')],
                ['personal', p('filterPersonal')],
                ['all', p('filterAll')],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setKindFilter(id)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    kindFilter === id ? 'border-primary bg-cyan-50 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button type="button" onClick={startCreate} className="text-sm font-medium text-primary hover:underline ml-1">
                {p('addChannel')}
              </button>
            </div>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-slate-500">{c.loading}</p>
          ) : visibleChannels.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">{p('empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">{p('colName')}</th>
                  <th className="p-3">{p('colCode')}</th>
                  <th className="p-3">{p('colRate')}</th>
                  <th className="p-3">{p('colSales')}</th>
                  <th className="p-3">{c.actions}</th>
                </tr>
              </thead>
              <tbody>
                {visibleChannels.map((channel) => (
                  <tr key={channel.id} className={`border-t border-slate-100 ${editingId === channel.id ? 'bg-cyan-50/60' : ''}`}>
                    <td className="p-3">
                      <p className="font-medium text-slate-900">{channel.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {p(
                          channel.kind === 'official'
                            ? 'kindOfficial'
                            : channel.kind === 'personal'
                              ? 'kindPersonal'
                              : 'kindPartner'
                        )}{' '}
                        · {p(`status_${channel.status}`)}
                      </p>
                    </td>
                    <td className="p-3 font-mono text-xs">{channel.code}</td>
                    <td className="p-3">{(channel.commissionBps / 100).toFixed(1)}%</td>
                    <td className="p-3">{formatMoney(channel.stats?.saleCents, channel.currency)}</td>
                    <td className="p-3 whitespace-nowrap">
                      <button type="button" className="text-primary hover:underline mr-3" onClick={() => startEdit(channel)}>
                        {c.edit}
                      </button>
                      {channel.slug !== 'official' ? (
                        <button type="button" className="text-red-600 hover:underline" onClick={() => remove(channel)}>
                          {c.delete}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={save} className="card p-5 space-y-3">
          <h2 className="font-semibold text-bingo-dark">{editingId ? p('editChannel') : p('addChannel')}</h2>
          <AdminField label={p('fieldName')} required>
            <input className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </AdminField>
          <div className="grid sm:grid-cols-2 gap-3">
            <AdminField label={p('fieldCode')} required>
              <input
                className="input w-full uppercase"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </AdminField>
            <AdminField label={p('fieldSlug')}>
              <input className="input w-full" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </AdminField>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <AdminField label={p('fieldKind')} required>
              <select className="input w-full" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="official">{p('kindOfficial')}</option>
                <option value="partner">{p('kindPartner')}</option>
                <option value="personal">{p('kindPersonal')}</option>
              </select>
            </AdminField>
            <AdminField label={c.status} required>
              <select className="input w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">{p('status_draft')}</option>
                <option value="active">{p('status_active')}</option>
                <option value="paused">{p('status_paused')}</option>
              </select>
            </AdminField>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <AdminField label={p('fieldRate')} required>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="input w-full"
                value={form.commissionPercent}
                onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
              />
            </AdminField>
            <AdminField label={p('fieldMinPayout')} required>
              <input
                type="number"
                min="0"
                step="1"
                className="input w-full"
                value={form.minPayoutDollars}
                onChange={(e) => setForm({ ...form, minPayoutDollars: e.target.value })}
              />
            </AdminField>
            <AdminField label={p('fieldHoldDays')} required>
              <input
                type="number"
                min="0"
                max="365"
                className="input w-full"
                value={form.holdDays}
                onChange={(e) => setForm({ ...form, holdDays: e.target.value })}
              />
            </AdminField>
          </div>
          <AdminField label={p('fieldContact')}>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="input w-full"
                placeholder={p('contactName')}
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
              <input
                type="email"
                className="input w-full"
                placeholder={p('contactEmail')}
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{p('contactHint')}</p>
          </AdminField>
          <AdminField label={p('fieldNotes')}>
            <textarea className="input w-full min-h-[72px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </AdminField>
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-sm disabled:opacity-60">
            {saving ? c.saving : c.save}
          </button>

          {editing ? (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-xs text-slate-500">
                {p('shareLink')}:{' '}
                <a href={shareUrl} className="text-primary break-all hover:underline">
                  {shareUrl}
                </a>
              </p>
              <h3 className="font-semibold text-sm">{p('members')}</h3>
              {contactNeedsMembership ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 space-y-2">
                  <p>{p('contactNotMember', { email: form.contactEmail.trim() })}</p>
                  <button
                    type="button"
                    className="font-medium text-amber-950 underline"
                    onClick={() => addMemberFromEmail(form.contactEmail)}
                  >
                    {p('addContactAsMember')}
                  </button>
                </div>
              ) : null}
              {(editing.members || []).length === 0 ? (
                <p className="text-xs text-slate-500">{p('noMembers')}</p>
              ) : (
                <ul className="space-y-1">
                  {editing.members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between text-sm">
                      <span>
                        {member.email || member.userId}{' '}
                        <span className="text-[11px] text-slate-500">{member.role}</span>
                      </span>
                      <button type="button" className="text-red-600 text-xs hover:underline" onClick={() => removeMember(member.userId)}>
                        {c.delete}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  className="input flex-1"
                  placeholder={p('memberEmail')}
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
                <select className="input w-28" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                  <option value="manager">{p('roleManager')}</option>
                  <option value="owner">{p('roleOwner')}</option>
                </select>
                <button type="button" onClick={addMember} className="px-3 rounded-lg bg-slate-900 text-white text-sm">
                  {p('addMember')}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">{p('memberHint')}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">{p('membersAfterSave')}</p>
          )}
        </form>
      </div>
    </div>
  )
}
