import { useState } from 'react'
import { createAdminUser } from '../../lib/admin/users'
import { logAdminAction } from '../../lib/admin/auth'
import AdminAlert from './AdminAlert'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const ROLES = ['user', 'editor', 'admin']
const STATUSES = ['active', 'suspended', 'pending']
const MEMBER_TIERS = ['free', 'monthly', 'quarterly', 'annual']

const INIT = {
  email: '',
  password: '',
  full_name: '',
  phone: '',
  role: 'user',
  status: 'active',
  member_tier: 'free',
  school: '',
  grade: '',
  email_confirm: true,
}

export default function AdminUserCreate({ onClose, onCreated }) {
  const c = useAdminCrud()
  const [form, setForm] = useState(INIT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const { user } = await createAdminUser({
        email: form.email.trim(),
        password: form.password,
        email_confirm: form.email_confirm,
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        status: form.status,
        member_tier: form.member_tier,
        school: form.school.trim() || undefined,
        grade: form.grade.trim() || undefined,
      })
      await logAdminAction('create', 'profiles', user.id, { email: user.email })
      onCreated?.(user)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <form
        className="w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-bingo-dark">{c.t('pages.users.create.title')}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6 flex-1 space-y-4">
          {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}

          <p className="text-sm text-slate-600">{c.t('pages.users.create.hint')}</p>

          <label className="block text-xs font-medium text-slate-600">
            {c.t('pages.users.create.email')}
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {c.t('pages.users.create.password')}
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              autoComplete="new-password"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.email_confirm}
              onChange={(e) => set('email_confirm', e.target.checked)}
            />
            {c.t('pages.users.create.emailConfirm')}
          </label>

          <hr className="border-slate-100" />

          <label className="block text-xs font-medium text-slate-600">
            {c.t('pages.users.create.fullName')}
            <input
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {c.t('pages.users.create.phone')}
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-slate-600">
              {c.t('pages.users.create.role')}
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
              {form.role === 'user' ? (
                <span className="text-[10px] text-amber-600 mt-1 block">
                  {c.t('pages.users.create.roleUserWarn')}
                </span>
              ) : null}
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {c.t('pages.users.create.status')}
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
            {c.t('pages.users.create.memberTier')}
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
              {c.t('pages.users.create.school')}
              <input
                value={form.school}
                onChange={(e) => set('school', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {c.t('pages.users.create.grade')}
              <input
                value={form.grade}
                onChange={(e) => set('grade', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium">
            {c.cancel}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-60"
          >
            {saving ? c.t('pages.users.create.creating') : c.t('pages.users.create.createBtn')}
          </button>
        </div>
      </form>
    </div>
  )
}
