import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { updateMyProfile } from '../lib/userProfile'

const EMPTY = {
  full_name: '',
  phone: '',
  avatar_url: '',
  locale: 'en',
  country: '',
  school: '',
  grade: '',
  parent_email: '',
}

function profileToForm(profile) {
  if (!profile) return { ...EMPTY }
  return {
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    avatar_url: profile.avatar_url || '',
    locale: profile.locale || 'en',
    country: profile.country || '',
    school: profile.school || '',
    grade: profile.grade || '',
    parent_email: profile.parent_email || '',
  }
}

export default function ProfileAccountForm({ userId, profile, userEmail, onSaved }) {
  const [form, setForm] = useState(() => profileToForm(profile))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setForm(profileToForm(profile))
  }, [profile])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const { data, error: saveErr } = await updateMyProfile(userId, form)
    setSaving(false)

    if (saveErr) {
      setError(saveErr.message || 'Could not save. Please try again.')
      return
    }

    setSuccess('Account information saved')
    onSaved?.(data)
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      ) : null}

      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          value={userEmail || ''}
          readOnly
          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Email is tied to your sign-in account. Contact support or use security settings to change it.
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Full name / nickname
        <input
          value={form.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          placeholder="Your name or nickname"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Phone
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="13800000000"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Avatar URL
        <input
          type="url"
          value={form.avatar_url}
          onChange={(e) => set('avatar_url', e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-slate-700">
          Language
          <select
            value={form.locale}
            onChange={(e) => set('locale', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="en">English</option>
            <option value="zh">Chinese</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Country / region
          <input
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            placeholder="United States"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-slate-700">
          School
          <input
            value={form.school}
            onChange={(e) => set('school', e.target.value)}
            placeholder="School name"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Grade
          <input
            value={form.grade}
            onChange={(e) => set('grade', e.target.value)}
            placeholder="e.g. Grade 10, G10"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Parent / guardian email
        <input
          type="email"
          value={form.parent_email}
          onChange={(e) => set('parent_email', e.target.value)}
          placeholder="parent@example.com"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary px-6 py-2 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : 'Save account info'}
        </button>
        <Link to="/reset-password" className="text-sm text-primary hover:underline">
          Change password →
        </Link>
      </div>
    </form>
  )
}
