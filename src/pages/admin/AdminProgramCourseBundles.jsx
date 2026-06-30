import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import AdminField from '../../components/admin/AdminField'
import AdminImageUpload from '../../components/admin/AdminImageUpload'
import AdminRichTextEditor from '../../components/admin/AdminRichTextEditor'
import { BUNDLE_COVER_PRESETS } from '../../config/bundleCover'
import { getProgramCurriculum, isCurriculumLine } from '../../config/programCurriculum'
import { formatIoaiPrice } from '../../lib/ioaiStore'
import {
  adminEnsureProgramCourseBundles,
  adminListProgramCourseBundles,
  adminSyncProgramCourseBundleModules,
  adminUpdateProgramCourseBundle,
} from '../../lib/ioaiCourseBundlesApi'
import { invalidateIoaiCourseBundlesCache } from '../../hooks/useIoaiCourseBundles'
import { useAdminCrud } from '../../hooks/useAdminCrud'

function centsToDollars(cents) {
  if (cents == null || cents === '') return ''
  return (Number(cents) / 100).toFixed(2)
}

function dollarsToCents(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100)
}

function emptyForm(bundle) {
  return {
    title: bundle?.title || '',
    coverUrl: bundle?.coverUrl || '',
    coverUrlHome: bundle?.coverUrlHome || '',
    price: centsToDollars(bundle?.priceCents),
    compareAt: centsToDollars(bundle?.compareAtCents ?? bundle?.listPriceCents),
    marketingTags: (bundle?.marketingTags || []).join(', '),
    introHtml: bundle?.introHtml || '',
    status: bundle?.status || 'live',
  }
}

function bundleKey(bundle) {
  return bundle?.slug || bundle?.id || null
}

function buildIntroSummary(moduleCount, lessonCount) {
  if (!moduleCount) return ''
  return `<p>One purchase unlocks all ${moduleCount} course unit${moduleCount === 1 ? '' : 's'} (${lessonCount} lesson${lessonCount === 1 ? '' : 's'}).</p>`
}

function isStaleBundleIntro(html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return true
  return /^All IOAI modules\s*[—-]\s*\d+\s*units?/i.test(text)
}

export default function AdminProgramCourseBundles() {
  const { line: lineParam } = useParams()
  const productLine = isCurriculumLine(lineParam) ? lineParam : null
  const config = productLine ? getProgramCurriculum(productLine) : null
  const c = useAdminCrud()
  const p = (key, params) => c.t(`pages.courseBundles.${key}`, params)

  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [form, setForm] = useState(emptyForm(null))

  const selected = useMemo(() => {
    if (!bundles.length) return null
    if (selectedKey) {
      const match = bundles.find((bundle) => bundleKey(bundle) === selectedKey)
      if (match) return match
    }
    return bundles[0]
  }, [bundles, selectedKey])

  const coursesCoverLabels = useMemo(
    () => ({
      label: p('bundleCoverCourses'),
      upload: p('bundleCoverUpload'),
      uploading: p('bundleCoverUploading'),
      remove: p('bundleCoverRemove'),
      dropzone: p('bundleCoverDropzone'),
      dropzoneActive: p('bundleCoverDropzoneActive'),
      replace: p('bundleCoverReplace'),
      replaceBtn: p('bundleCoverReplaceBtn'),
      formats: p('bundleCoverFormatsAuto'),
      advanced: p('bundleCoverAdvanced'),
      urlPlaceholder: p('bundleCoverUrlOptional'),
      hint: p('bundleCoverCoursesHint'),
    }),
    [c]
  )

  const homeCoverLabels = useMemo(
    () => ({
      label: p('bundleCoverHome'),
      upload: p('bundleCoverUpload'),
      uploading: p('bundleCoverUploading'),
      remove: p('bundleCoverRemove'),
      dropzone: p('bundleCoverDropzone'),
      dropzoneActive: p('bundleCoverDropzoneActive'),
      replace: p('bundleCoverReplace'),
      replaceBtn: p('bundleCoverReplaceBtn'),
      formats: p('bundleCoverFormatsAuto'),
      advanced: p('bundleCoverAdvanced'),
      urlPlaceholder: p('bundleCoverUrlOptional'),
      hint: p('bundleCoverHomeHint'),
    }),
    [c]
  )

  const load = useCallback(async () => {
    if (!productLine) return
    setLoading(true)
    setError(null)
    try {
      const data = await adminListProgramCourseBundles(productLine)
      const rows = data.bundles || []
      setBundles(rows)
      setSelectedKey((prev) => prev || rows[0]?.slug || null)
    } catch (err) {
      setError(err.message || p('loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [productLine])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (selected) setForm(emptyForm(selected))
  }, [selected?.id, selected?.slug])

  if (!productLine || !config) {
    return <Navigate to="/admin/curriculum/ioai/bundles" replace />
  }

  const pageTitle = `${c.t(`nav.${productLine}Hub`)} · ${c.t(`nav.${productLine}CourseBundles`)}`
  const pageDesc = p(`desc_${productLine}`)

  const save = async () => {
    if (!selected?.id) {
      setError(p('noBundleId'))
      return
    }
    const priceCents = dollarsToCents(form.price)
    if (priceCents == null || priceCents < 0) {
      setError(p('salePriceRequired'))
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        title: form.title.trim(),
        cover_url: form.coverUrl.trim() || null,
        cover_url_home: form.coverUrlHome.trim() || null,
        price_cents: priceCents,
        compare_at_cents: dollarsToCents(form.compareAt),
        marketing_tags: form.marketingTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        intro_html: form.introHtml,
        status: form.status,
      }
      const data = await adminUpdateProgramCourseBundle(productLine, selected.id, payload)
      if (productLine === 'ioai') invalidateIoaiCourseBundlesCache()
      setBundles((rows) => rows.map((row) => (row.id === data.bundle.id ? data.bundle : row)))
      setForm(emptyForm(data.bundle))
      setSuccess(p('saved'))
    } catch (err) {
      setError(err.message || p('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const syncModules = async () => {
    if (!selected?.id) return
    setSyncing(true)
    setError(null)
    try {
      const data = await adminSyncProgramCourseBundleModules(productLine, selected.id, selected.levelSlug)
      if (productLine === 'ioai') invalidateIoaiCourseBundlesCache()
      setBundles((rows) => rows.map((row) => (row.id === data.bundle.id ? data.bundle : row)))
      setForm(emptyForm(data.bundle))
      setSuccess(p('syncSuccess', { count: String(data.moduleCount) }))
    } catch (err) {
      setError(err.message || p('syncFailed'))
    } finally {
      setSyncing(false)
    }
  }

  const ensureAll = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await adminEnsureProgramCourseBundles(productLine)
      const rows = data.bundles || []
      setBundles(rows)
      setSelectedKey((prev) => {
        if (!rows.length) return null
        if (prev) {
          const matched = rows.find((row) => row.slug === prev || row.id === prev)
          if (matched?.slug) return matched.slug
        }
        return rows[0]?.slug || null
      })
      setSuccess(p('ensureSuccess'))
    } catch (err) {
      setError(err.message || p('ensureFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={pageTitle} description={pageDesc} />

      <div className="flex flex-wrap gap-2 text-sm">
        <Link to={config.adminPath} className="text-primary hover:underline">
          {p('backToCurriculum', {
            line: `${c.t(`nav.${productLine}Hub`)} · ${c.t(`nav.${productLine}Curriculum`)}`,
          })}
        </Link>
        <Link to={`/mall?tab=${productLine}`} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline">
          {p('previewMall')}
        </Link>
        <Link to={config.frontendPath} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline">
          {p('previewCourses')}
        </Link>
      </div>

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      {loading ? (
        <p className="text-sm text-slate-500">{p('loading')}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {bundles.map((bundle) => {
              const key = bundleKey(bundle)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border ${
                    bundleKey(selected) === key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40'
                  }`}
                >
                  {bundle.emoji} {bundle.title}
                </button>
              )
            })}
            <button type="button" onClick={ensureAll} className="px-3 py-2 rounded-xl text-sm border border-dashed border-slate-300">
              {p('ensureBundles')}
            </button>
          </div>

          {selected ? (
            <div key={bundleKey(selected)} className="card p-5 sm:p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">{p('slug')}</p>
                  <p className="font-mono text-xs text-slate-700">{selected.slug}</p>
                </div>
                <div>
                  <p className="text-slate-500">{p('includedModules')}</p>
                  <p className="font-semibold text-bingo-dark">
                    {p('moduleLessonCount', {
                      modules: String(selected.moduleCount),
                      lessons: String(selected.lessonCount),
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{p('includedModulesHint')}</p>
                </div>
                <div>
                  <p className="text-slate-500">{p('listPrice')}</p>
                  <p className="font-semibold text-bingo-dark">{formatIoaiPrice(selected.listPriceCents, selected.currency)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{p('listPriceHint')}</p>
                </div>
                <div>
                  <p className="text-slate-500">{p('currentDiscount')}</p>
                  <p className="font-semibold text-rose-700">
                    {selected.discountPercent
                      ? p('discountSave', { percent: String(selected.discountPercent) })
                      : p('noDiscount')}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-200/80 bg-cyan-50/60 px-4 py-3 text-sm text-cyan-950">
                <p className="font-semibold">{p('howToAddUnitsTitle')}</p>
                <p className="text-xs text-cyan-900/90 mt-1 leading-relaxed">{p('howToAddUnitsBody')}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-2">{p('linkedModulesTitle')}</p>
                {selected.linkedModules?.length ? (
                  <ul className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
                    {selected.linkedModules.map((mod) => (
                      <li key={mod.catalogSlug} className="px-3 py-2 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span className="font-medium text-bingo-dark">{mod.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{mod.catalogSlug}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    {p('noLinkedModules')}
                  </p>
                )}
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <AdminImageUpload
                  value={form.coverUrlHome}
                  onChange={(url) => setForm((prev) => ({ ...prev, coverUrlHome: url }))}
                  labels={homeCoverLabels}
                  folder="bundles/home"
                  aspectClass={BUNDLE_COVER_PRESETS.home.aspectClass}
                  maxWidthClass="max-w-md"
                  resizePreset={BUNDLE_COVER_PRESETS.home}
                  disabled={saving}
                />
                <AdminImageUpload
                  value={form.coverUrl}
                  onChange={(url) => setForm((prev) => ({ ...prev, coverUrl: url }))}
                  labels={coursesCoverLabels}
                  folder="bundles/courses"
                  aspectClass={BUNDLE_COVER_PRESETS.courses.aspectClass}
                  maxWidthClass="max-w-md"
                  resizePreset={BUNDLE_COVER_PRESETS.courses}
                  disabled={saving}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <AdminField label={p('displayTitle')}>
                  <input
                    className="input w-full"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </AdminField>
                <AdminField label={p('status')}>
                  <select
                    className="input w-full"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="live">{p('statusLive')}</option>
                    <option value="draft">{p('statusDraft')}</option>
                    <option value="offline">{p('statusOffline')}</option>
                  </select>
                </AdminField>
                <AdminField label={p('salePrice')}>
                  <input
                    className="input w-full"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{p('salePriceHint')}</p>
                </AdminField>
                <AdminField label={p('compareAtPrice')}>
                  <input
                    className="input w-full"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, compareAt: e.target.value }))}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{p('compareAtHint')}</p>
                </AdminField>
                <AdminField label={p('promoLabels')} className="sm:col-span-2">
                  <input
                    className="input w-full"
                    value={form.marketingTags}
                    onChange={(e) => setForm((prev) => ({ ...prev, marketingTags: e.target.value }))}
                    placeholder={p('promoPlaceholder')}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{p('promoHint')}</p>
                </AdminField>
              </div>

              <AdminField label={p('productDetail')}>
                <p className="text-[11px] text-slate-500 mb-2">{p('cardDescNote')}</p>
                {isStaleBundleIntro(form.introHtml) ? (
                  <AdminAlert type="warning">{p('staleIntroWarning')}</AdminAlert>
                ) : null}
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        introHtml: buildIntroSummary(selected.moduleCount, selected.lessonCount),
                      }))
                    }
                  >
                    {p('insertModuleSummary')}
                  </button>
                </div>
                <AdminRichTextEditor
                  key={`intro-${bundleKey(selected)}`}
                  value={form.introHtml}
                  onChange={(introHtml) => setForm((prev) => ({ ...prev, introHtml }))}
                  minHeight={180}
                  uploadFolder="bundles"
                />
              </AdminField>

              <div className="flex flex-wrap gap-2 items-start">
                <button type="button" onClick={save} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
                  {saving ? c.saving : p('saveBundle')}
                </button>
                <div>
                  <button
                    type="button"
                    onClick={syncModules}
                    disabled={syncing}
                    className="px-5 py-2.5 text-sm rounded-xl border border-slate-300 disabled:opacity-60"
                  >
                    {syncing ? p('syncing') : p('syncModules')}
                  </button>
                  <p className="text-[11px] text-slate-500 mt-1.5 max-w-xl">{p('syncModulesHint')}</p>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
