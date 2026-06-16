import { useEffect, useState } from 'react'
import AdminField from '../../../components/admin/AdminField'
import { inputClass, textareaClass } from '../../../components/admin/community/CommunityAdminCrud'
import { useAdminCrud } from '../../../hooks/useAdminCrud'
import { fetchPlatformSetting, upsertPlatformSetting } from '../../../lib/platformSettings'
import { COMMUNITY_HOME_DEFAULT } from '../../../config/seed/communityContent'

const TAB_TARGETS = ['mentors', 'scholars', 'checkin', 'forum', 'courses', 'partners', 'home']

const emptyPillar = {
  icon: '🏆',
  color: 'border-primary/20',
  btnColor: 'btn-primary',
  tabTarget: 'mentors',
  title: '',
  pain: '',
  value: '',
  stat: '',
}

const emptyStat = { value: '', label: '' }

export default function CommunityHomeEditor() {
  const c = useAdminCrud()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState(COMMUNITY_HOME_DEFAULT)

  useEffect(() => {
    let cancelled = false
    fetchPlatformSetting('community_home')
      .then((value) => {
        if (cancelled) return
        if (value && typeof value === 'object') {
          setForm({
            pillarsTitle: value.pillarsTitle ?? COMMUNITY_HOME_DEFAULT.pillarsTitle,
            pillars: value.pillars?.length ? value.pillars : COMMUNITY_HOME_DEFAULT.pillars,
            stats: value.stats?.length ? value.stats : COMMUNITY_HOME_DEFAULT.stats,
          })
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const save = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await upsertPlatformSetting('community_home', form)
      setSuccess(c.t('pages.community.homeSaved'))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const updatePillar = (index, key, value) => {
    setForm((f) => ({
      ...f,
      pillars: f.pillars.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }))
  }

  const updateStat = (index, key, value) => {
    setForm((f) => ({
      ...f,
      stats: f.stats.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    }))
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">{c.loading}</div>
  }

  return (
    <div className="space-y-6">
      {error ? <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div> : null}
      {success ? <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm">{success}</div> : null}

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">{c.t('pages.community.homeHeadings')}</h2>
        <AdminField label={c.t('pages.community.pillarsTitle')}>
          <input className={inputClass} value={form.pillarsTitle} onChange={(e) => setForm((f) => ({ ...f, pillarsTitle: e.target.value }))} />
        </AdminField>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{c.t('pages.community.pillarsList')}</h2>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, pillars: [...f.pillars, { ...emptyPillar }] }))}
            className="text-sm text-primary hover:underline"
          >
            {c.addItem(c.t('pages.community.pillarItem'))}
          </button>
        </div>
        {form.pillars.map((pillar, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm text-slate-700">{c.t('pages.community.pillarItem')} #{index + 1}</h3>
              {form.pillars.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, pillars: f.pillars.filter((_, i) => i !== index) }))}
                  className="text-xs text-red-600 hover:underline"
                >
                  {c.delete}
                </button>
              ) : null}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label={c.t('pages.community.icon')}>
                <input className={inputClass} value={pillar.icon} onChange={(e) => updatePillar(index, 'icon', e.target.value)} />
              </AdminField>
              <AdminField label={c.title} required>
                <input className={inputClass} value={pillar.title} onChange={(e) => updatePillar(index, 'title', e.target.value)} />
              </AdminField>
              <AdminField label={c.t('pages.community.pillarPain')}>
                <input className={inputClass} value={pillar.pain} onChange={(e) => updatePillar(index, 'pain', e.target.value)} />
              </AdminField>
              <AdminField label={c.t('pages.community.pillarStat')}>
                <input className={inputClass} value={pillar.stat} onChange={(e) => updatePillar(index, 'stat', e.target.value)} />
              </AdminField>
              <AdminField label={c.t('pages.community.tabTarget')}>
                <select className={inputClass} value={pillar.tabTarget} onChange={(e) => updatePillar(index, 'tabTarget', e.target.value)}>
                  {TAB_TARGETS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </AdminField>
              <AdminField label={c.t('pages.community.colorClasses')}>
                <input className={inputClass} value={pillar.color} onChange={(e) => updatePillar(index, 'color', e.target.value)} />
              </AdminField>
              <AdminField label={c.t('pages.community.btnColorClasses')} className="sm:col-span-2">
                <input className={inputClass} value={pillar.btnColor} onChange={(e) => updatePillar(index, 'btnColor', e.target.value)} />
              </AdminField>
              <AdminField label={c.t('pages.community.description')} className="sm:col-span-2">
                <textarea className={textareaClass} value={pillar.value} onChange={(e) => updatePillar(index, 'value', e.target.value)} />
              </AdminField>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{c.t('pages.community.statsList')}</h2>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, stats: [...f.stats, { ...emptyStat }] }))}
            className="text-sm text-primary hover:underline"
          >
            {c.addItem(c.t('pages.community.statItem'))}
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {form.stats.map((stat, index) => (
            <div key={index} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">{c.t('pages.community.statItem')} #{index + 1}</span>
                {form.stats.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, stats: f.stats.filter((_, i) => i !== index) }))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    {c.delete}
                  </button>
                ) : null}
              </div>
              <div className="space-y-3">
                <AdminField label={c.t('pages.community.statValue')}>
                  <input className={inputClass} value={stat.value} onChange={(e) => updateStat(index, 'value', e.target.value)} />
                </AdminField>
                <AdminField label={c.t('pages.community.statLabel')}>
                  <input className={inputClass} value={stat.label} onChange={(e) => updateStat(index, 'label', e.target.value)} />
                </AdminField>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={save} disabled={saving} className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-60">
        {saving ? c.saving : c.save}
      </button>
    </div>
  )
}
