import { useEffect, useState } from 'react'
import AdminField from '../../../components/admin/AdminField'
import { useAdminCrud } from '../../../hooks/useAdminCrud'
import { fetchPlatformSetting, upsertPlatformSetting } from '../../../lib/platformSettings'
import {
  MALL_PAGE_DEFAULT,
  MALL_PAGE_SETTING_KEY,
  mergeMallPageContent,
} from '../../../config/mallContent'
import { MALL_STOREFRONT_TABS } from '../../../config/mallTabs'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
const textareaClass = `${inputClass} resize-y min-h-[72px]`

function ListEditor({ label, items, fields, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-bingo-dark">{label}</p>
        <button type="button" onClick={onAdd} className="text-xs text-primary hover:underline">
          + Add
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">#{index + 1}</span>
            {items.length > 1 ? (
              <button type="button" onClick={() => onRemove(index)} className="text-xs text-red-600">
                Remove
              </button>
            ) : null}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <AdminField
                key={field.key}
                label={field.label}
                className={field.full ? 'sm:col-span-2' : ''}
              >
                {field.multiline ? (
                  <textarea
                    value={item[field.key] ?? ''}
                    onChange={(e) => onChange(index, field.key, e.target.value)}
                    rows={2}
                    className={textareaClass}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={item[field.key] ?? ''}
                    onChange={(e) => onChange(index, field.key, e.target.value)}
                    className={inputClass}
                  />
                )}
              </AdminField>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MallPageSettingsEditor({ sectionId }) {
  const c = useAdminCrud()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState(MALL_PAGE_DEFAULT)

  useEffect(() => {
    let cancelled = false
    fetchPlatformSetting(MALL_PAGE_SETTING_KEY)
      .then((value) => {
        if (!cancelled) setForm(mergeMallPageContent(value))
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await upsertPlatformSetting(MALL_PAGE_SETTING_KEY, form)
      setSuccess(c.t('pages.mall.settingsSaved'))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const updatePath = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev)
      let cursor = next
      const keys = path.split('.')
      for (let i = 0; i < keys.length - 1; i++) {
        cursor = cursor[keys[i]]
      }
      cursor[keys[keys.length - 1]] = value
      return next
    })
  }

  const updateListItem = (path, index, key, value) => {
    setForm((prev) => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cursor = next
      for (const k of keys) cursor = cursor[k]
      cursor[index] = { ...cursor[index], [key]: value }
      return next
    })
  }

  const addListItem = (path, template) => {
    setForm((prev) => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cursor = next
      for (const k of keys) cursor = cursor[k]
      cursor.push({ ...template })
      return next
    })
  }

  const removeListItem = (path, index) => {
    setForm((prev) => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cursor = next
      for (const k of keys) cursor = cursor[k]
      cursor.splice(index, 1)
      return next
    })
  }

  if (loading) {
    return <div className="card p-6 text-sm text-slate-500 mb-6">{c.loading}</div>
  }

  const tabMeta = MALL_STOREFRONT_TABS.find((t) => t.id === sectionId)
  const tabForm = form.tabs?.[sectionId] ?? {}

  return (
    <div className="card p-6 mb-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-bingo-dark">
          {c.t('pages.mall.pageSettings')}
          {tabMeta ? ` · ${tabMeta.label}` : ''}
        </h2>
        <button type="button" onClick={save} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? c.loading : c.save}
        </button>
      </div>

      {error ? <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div> : null}
      {success ? <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm">{success}</div> : null}

      {sectionId === 'home' ? (
        <>
          <AdminField label={c.t('pages.mall.fields.introText')}>
            <textarea
              value={form.intro.text}
              onChange={(e) => updatePath('intro.text', e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </AdminField>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.intro.showPoints}
              onChange={(e) => updatePath('intro.showPoints', e.target.checked)}
            />
            {c.t('pages.mall.fields.showPoints')}
          </label>

          <ListEditor
            label={c.t('pages.mall.fields.stats')}
            items={form.stats}
            fields={[
              { key: 'value', label: 'Value' },
              { key: 'label', label: 'Label' },
            ]}
            onChange={(i, k, v) => updateListItem('stats', i, k, v)}
            onAdd={() => addListItem('stats', { value: '', label: '' })}
            onRemove={(i) => removeListItem('stats', i)}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label={c.t('pages.mall.fields.flashDealsTitle')}>
              <input value={tabForm.flashDeals?.title ?? ''} onChange={(e) => updatePath('tabs.home.flashDeals.title', e.target.value)} className={inputClass} />
            </AdminField>
            <AdminField label={c.t('pages.mall.fields.flashDealsSubtitle')}>
              <input value={tabForm.flashDeals?.subtitle ?? ''} onChange={(e) => updatePath('tabs.home.flashDeals.subtitle', e.target.value)} className={inputClass} />
            </AdminField>
            <AdminField label={c.t('pages.mall.fields.flashDealsLimit')}>
              <input type="number" min={1} max={24} value={tabForm.flashDeals?.limit ?? 6} onChange={(e) => updatePath('tabs.home.flashDeals.limit', parseInt(e.target.value, 10) || 6)} className={inputClass} />
            </AdminField>
          </div>

          <AdminField label={c.t('pages.mall.fields.trustTitle')}>
            <input value={tabForm.trust?.title ?? ''} onChange={(e) => updatePath('tabs.home.trust.title', e.target.value)} className={inputClass} />
          </AdminField>
          <ListEditor
            label={c.t('pages.mall.fields.trustItems')}
            items={tabForm.trust?.items ?? []}
            fields={[
              { key: 'icon', label: 'Icon' },
              { key: 'title', label: 'Title' },
              { key: 'desc', label: 'Description', multiline: true, full: true },
            ]}
            onChange={(i, k, v) => updateListItem('tabs.home.trust.items', i, k, v)}
            onAdd={() => addListItem('tabs.home.trust.items', { icon: '✨', title: '', desc: '' })}
            onRemove={(i) => removeListItem('tabs.home.trust.items', i)}
          />

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-bingo-dark text-sm">{c.t('pages.mall.fields.bottomCta')}</h3>
            <AdminField label="Title">
              <input value={form.bottomCta.title} onChange={(e) => updatePath('bottomCta.title', e.target.value)} className={inputClass} />
            </AdminField>
            <AdminField label="Description">
              <textarea value={form.bottomCta.desc} onChange={(e) => updatePath('bottomCta.desc', e.target.value)} rows={2} className={textareaClass} />
            </AdminField>
            <ListEditor
              label="Buttons"
              items={form.bottomCta.buttons ?? []}
              fields={[
                { key: 'label', label: 'Label' },
                { key: 'action', label: 'Action (tab:id or link:/path)' },
                { key: 'style', label: 'Style (primary | amber | outline)' },
              ]}
              onChange={(i, k, v) => updateListItem('bottomCta.buttons', i, k, v)}
              onAdd={() => addListItem('bottomCta.buttons', { label: '', action: 'tab:home', style: 'primary' })}
              onRemove={(i) => removeListItem('bottomCta.buttons', i)}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label={c.t('pages.mall.fields.headerTitle')} className="sm:col-span-2">
              <input value={tabForm.header?.title ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.header.title`, e.target.value)} className={inputClass} />
            </AdminField>
            <AdminField label={c.t('pages.mall.fields.headerDesc')} className="sm:col-span-2">
              <textarea value={tabForm.header?.desc ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.header.desc`, e.target.value)} rows={2} className={textareaClass} />
            </AdminField>
            <AdminField label={c.t('pages.mall.fields.headerCardClass')} className="sm:col-span-2">
              <input value={tabForm.header?.cardClass ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.header.cardClass`, e.target.value)} className={inputClass} />
            </AdminField>
          </div>

          {tabForm.footerLink != null ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label={c.t('pages.mall.fields.footerLinkText')}>
                <input value={tabForm.footerLink?.text ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.footerLink.text`, e.target.value)} className={inputClass} />
              </AdminField>
              <AdminField label={c.t('pages.mall.fields.footerLinkHref')}>
                <input value={tabForm.footerLink?.href ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.footerLink.href`, e.target.value)} className={inputClass} />
              </AdminField>
            </div>
          ) : null}

          {sectionId === 'general' ? (
            <AdminField label={c.t('pages.mall.fields.materialPreviewCount')}>
              <input
                type="number"
                min={0}
                max={12}
                value={tabForm.materialPreviewCount ?? 2}
                onChange={(e) => updatePath('tabs.general.materialPreviewCount', parseInt(e.target.value, 10) || 0)}
                className={inputClass}
              />
            </AdminField>
          ) : null}

          {tabForm.cta ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label="CTA text" className="sm:col-span-2">
                <input value={tabForm.cta.text ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.cta.text`, e.target.value)} className={inputClass} />
              </AdminField>
              <AdminField label="CTA button">
                <input value={tabForm.cta.buttonText ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.cta.buttonText`, e.target.value)} className={inputClass} />
              </AdminField>
              <AdminField label="CTA link">
                <input value={tabForm.cta.href ?? ''} onChange={(e) => updatePath(`tabs.${sectionId}.cta.href`, e.target.value)} className={inputClass} />
              </AdminField>
            </div>
          ) : null}

          {sectionId === 'materials' ? (
            <ListEditor
              label={c.t('pages.mall.fields.filterLabels')}
              items={(tabForm.filterLabels ?? []).map((label) => ({ label }))}
              fields={[{ key: 'label', label: 'Label' }]}
              onChange={(i, _k, v) => {
                const labels = [...(tabForm.filterLabels ?? [])]
                labels[i] = v
                updatePath('tabs.materials.filterLabels', labels)
              }}
              onAdd={() => {
                const labels = [...(tabForm.filterLabels ?? []), 'New filter']
                updatePath('tabs.materials.filterLabels', labels)
              }}
              onRemove={(i) => removeListItem('tabs.materials.filterLabels', i)}
            />
          ) : null}

          {sectionId === 'lab' ? (
            <>
              <ListEditor
                label={c.t('pages.mall.fields.labFeatures')}
                items={tabForm.features ?? []}
                fields={[
                  { key: 'icon', label: 'Icon' },
                  { key: 'title', label: 'Title' },
                  { key: 'desc', label: 'Description', multiline: true, full: true },
                ]}
                onChange={(i, k, v) => updateListItem(`tabs.lab.features`, i, k, v)}
                onAdd={() => addListItem('tabs.lab.features', { icon: '🧪', title: '', desc: '' })}
                onRemove={(i) => removeListItem('tabs.lab.features', i)}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <AdminField label={c.t('pages.mall.fields.bookingButton')}>
                  <input value={tabForm.bookingButton ?? ''} onChange={(e) => updatePath('tabs.lab.bookingButton', e.target.value)} className={inputClass} />
                </AdminField>
                <AdminField label={c.t('pages.mall.fields.bookingTitle')}>
                  <input value={tabForm.bookingTitle ?? ''} onChange={(e) => updatePath('tabs.lab.bookingTitle', e.target.value)} className={inputClass} />
                </AdminField>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
