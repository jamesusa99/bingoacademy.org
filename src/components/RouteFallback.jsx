/** Lightweight route transition — avoids layout shift on lazy route loads */
export default function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm" aria-busy="true">
      Loading…
    </div>
  )
}
