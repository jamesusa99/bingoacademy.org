import { useEffect, useState } from 'react'
import { fetchAdminUser, updateAdminUser, syncAdminUsers } from '../../lib/admin/users'
import { supabase } from '../../lib/supabase'
import { logAdminAction } from '../../lib/admin/auth'
import AdminAlert from './AdminAlert'

const ROLES = ['user', 'editor', 'admin']
const STATUSES = ['active', 'suspended', 'pending']
const MEMBER_TIERS = ['free', 'monthly', 'quarterly', 'annual']

const EMPTY = {
  full_name: '',
  phone: '',
  role: 'user',
  status: 'active',
  member_tier: 'free',
  locale: 'en',
  country: '',
  school: '',
  grade: '',
  parent_email: '',
  internal_notes: '',
  tags: [],
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

function tagsToString(tags) {
  if (!Array.isArray(tags)) return ''
  return tags.join(', ')
}

function parseTags(str) {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function AdminUserDetail({ userId, onClose, onSaved }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (!userId) return
    let mounted = true

    function applyUser(dataUser, dataOrders) {
      setUser(dataUser)
      setOrders(dataOrders)
      setForm({
        full_name: dataUser.full_name || '',
        phone: dataUser.phone || '',
        role: dataUser.role || 'user',
        status: dataUser.status || 'active',
        member_tier: dataUser.member_tier || 'free',
        locale: dataUser.locale || 'en',
        country: dataUser.country || '',
        school: dataUser.school || '',
        grade: dataUser.grade || '',
        parent_email: dataUser.parent_email || '',
        internal_notes: dataUser.internal_notes || '',
        tags: dataUser.tags || [],
      })
      setTagsInput(tagsToString(dataUser.tags))
    }

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchAdminUser(userId)
        if (!mounted) return
        applyUser(data.user, data.orders || [])
      } catch (err) {
        const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (!mounted) return
        if (profileErr || !profile) {
          setError(err.message || profileErr?.message || 'User not found')
        } else {
          applyUser({ ...profile, auth: null, order_count: 0 }, [])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const payload = { ...form, tags: parseTags(tagsInput), updated_at: new Date().toISOString() }
    try {
      const { user: updated } = await updateAdminUser(userId, payload)
      await logAdminAction('update', 'profiles', userId, { fields: Object.keys(payload) })
      setUser(updated)
      onSaved?.(updated)
    } catch (err) {
      const { data, error: saveErr } = await supabase.from('profiles').update(payload).eq('id', userId).select().single()
      if (saveErr) {
        setError(err.message || saveErr.message)
      } else {
        const updated = { ...user, ...data, auth: user?.auth }
        await logAdminAction('update', 'profiles', userId, { fields: Object.keys(payload) })
        setUser(updated)
        onSaved?.(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-bingo-dark">User details</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6 flex-1">
          {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}

          {loading ? (
            <p className="text-sm text-slate-500">Loading user…</p>
          ) : user ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-xl text-slate-500">
                    {(user.full_name || user.email || '?')[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-bingo-dark truncate">{user.full_name || 'No name'}</p>
                  <p className="text-sm text-slate-500 truncate">{user.email || user.auth?.email}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{user.id}</p>
                </div>
              </div>

              <section className="mb-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-medium text-slate-700">Registered:</span> {formatDate(user.auth?.created_at || user.created_at)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Last sign-in:</span> {formatDate(user.auth?.last_sign_in_at)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Email confirmed:</span>{' '}
                  {user.auth?.email_confirmed_at ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Orders:</span> {user.order_count ?? orders.length}
                </p>
              </section>

              <h3 className="text-sm font-semibold text-bingo-dark mb-3">Profile</h3>
              <div className="grid gap-3 mb-6">
                <label className="block text-xs font-medium text-slate-600">
                  Full name
                  <input
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Phone
                  <input
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-slate-600">
                    Role
                    <select
                      value={form.role}
                      onChange={(e) => set('role', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Status
                    <select
                      value={form.status}
                      onChange={(e) => set('status', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-xs font-medium text-slate-600">
                  Member tier
                  <select
                    value={form.member_tier}
                    onChange={(e) => set('member_tier', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {MEMBER_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-slate-600">
                    Locale
                    <input
                      value={form.locale}
                      onChange={(e) => set('locale', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Country
                    <input
                      value={form.country}
                      onChange={(e) => set('country', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-slate-600">
                    School
                    <input
                      value={form.school}
                      onChange={(e) => set('school', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Grade
                    <input
                      value={form.grade}
                      onChange={(e) => set('grade', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <label className="block text-xs font-medium text-slate-600">
                  Parent / guardian email
                  <input
                    type="email"
                    value={form.parent_email}
                    onChange={(e) => set('parent_email', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Tags (comma-separated)
                  <input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="vip, ioai, referral"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Internal notes (admin only)
                  <textarea
                    value={form.internal_notes}
                    onChange={(e) => set('internal_notes', e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              {orders.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold text-bingo-dark mb-2">Recent orders</h3>
                  <ul className="text-xs space-y-2 mb-6 border border-slate-100 rounded-xl p-3">
                    {orders.map((o) => (
                      <li key={o.id} className="flex justify-between gap-2">
                        <span className="text-slate-700">{o.product_name || 'Order'}</span>
                        <span className="text-slate-500 shrink-0">
                          {o.status} · {new Date(o.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
