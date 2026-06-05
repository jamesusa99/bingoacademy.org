import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getPurchasedSlugs, IOAI_FULL_TRACK_SLUG } from '../../lib/courseAccess'
import { getFreeTrialState } from '../../lib/freeTrial'
import { isSupabaseConfigured } from '../../lib/supabase'
import { supabaseProjectRef } from '../../lib/coursesDebug'

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-1 border-b border-amber-200/60 last:border-0 text-xs">
      <span className="text-amber-900/70 font-medium shrink-0">{label}</span>
      <span className="text-amber-950 font-mono break-all">{children}</span>
    </div>
  )
}

function SlugList({ slugs, max = 8 }) {
  if (!slugs?.length) return '—'
  const shown = slugs.slice(0, max)
  const rest = slugs.length - shown.length
  return (
    <>
      {shown.join(', ')}
      {rest > 0 ? ` … (+${rest} more)` : ''}
    </>
  )
}

export default function CoursesDebugPanel({
  catalogSource,
  catalogError,
  coursesTotal,
  filteredCount,
  lineId,
  subId,
  purchase,
  user,
  isAuthenticated,
  onReloadCatalog,
}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const localSlugs = useMemo(() => getPurchasedSlugs(), [purchase?.purchased])
  const trial = useMemo(() => getFreeTrialState(), [purchase?.purchased])

  const remoteSlugs = purchase?.remoteSlugs ?? []
  const merged = purchase?.purchased ?? []
  const remoteOnly = remoteSlugs.filter((s) => !localSlugs.includes(s))
  const localOnly = localSlugs.filter((s) => !remoteSlugs.includes(s))

  const unlockedInView = useMemo(() => {
    if (!purchase?.hasAccess || !filteredCount) return null
    return merged.filter((slug) => purchase.hasAccess(slug)).length
  }, [purchase, merged, filteredCount])

  return (
    <section className="mb-6 rounded-xl border-2 border-dashed border-amber-400/80 bg-amber-50/90 p-4 text-left">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Courses debug</p>
          <p className="text-[10px] text-amber-700/80 mt-0.5">
            Compare local vs production — add <code className="bg-amber-100 px-1 rounded">?debug=1</code> on
            production. Hide: remove query param (dev always shows).
          </p>
        </div>
        {onReloadCatalog ? (
          <button
            type="button"
            onClick={onReloadCatalog}
            className="text-[10px] font-semibold px-2 py-1 rounded bg-amber-200 text-amber-900 hover:bg-amber-300"
          >
            Reload catalog
          </button>
        ) : null}
      </div>

      <div className="space-y-0">
        <Row label="Host">{typeof window !== 'undefined' ? window.location.host : '—'}</Row>
        <Row label="Supabase">{isSupabaseConfigured ? supabaseProjectRef(supabaseUrl) : 'not configured (static)'}</Row>
        <Row label="Catalog source">{catalogSource || '—'}</Row>
        <Row label="Catalog error">{catalogError || '—'}</Row>
        <Row label="Courses in DB">{catalogSource === 'loading' ? '…' : coursesTotal}</Row>
        <Row label="Filter">{lineId || '—'}{subId ? ` / sub=${subId}` : ''} → {filteredCount} shown</Row>
        <Row label="Signed in">{isAuthenticated ? user?.email || user?.id || 'yes' : 'no (guest)'}</Row>
        <Row label="Stripe checkout">{purchase?.stripeCheckout ? 'enabled' : 'demo / off'}</Row>
        <Row label="IOAI full track">
          {purchase?.hasTrack ? `yes (${IOAI_FULL_TRACK_SLUG})` : 'no'}
        </Row>
        <Row label="Free trial">{trial?.claimedAt ? `claimed · ${trial.lessonId || '—'}` : 'no'}</Row>
        <Row label="Local unlocks">{localSlugs.length} — <SlugList slugs={localSlugs} /></Row>
        <Row label="Server enrollments">{remoteSlugs.length} — <SlugList slugs={remoteSlugs} /></Row>
        <Row label="Merged access">{merged.length} — <SlugList slugs={merged} /></Row>
        {remoteOnly.length ? (
          <Row label="Server only">
            <SlugList slugs={remoteOnly} />
          </Row>
        ) : null}
        {localOnly.length ? (
          <Row label="Local only">
            <SlugList slugs={localOnly} />
          </Row>
        ) : null}
        {unlockedInView != null ? (
          <Row label="Unlocked in view">{unlockedInView} / {filteredCount} show “Study Center”</Row>
        ) : null}
        <Row label="Reset access">
          <Link to="/profile?debug=1#settings" className="text-amber-900 underline hover:text-amber-950">
            Profile → Account settings
          </Link>
          {' '}(add <code className="bg-amber-100 px-1 rounded">?debug=1</code> on production)
        </Row>
      </div>
    </section>
  )
}
