export default function AssessmentDock({ status, message }) {
  const styles = {
    idle: 'border-slate-700 bg-slate-900/80',
    pass: 'border-emerald-500/50 bg-emerald-500/10 ioai-dock--pass',
    fail: 'border-amber-500/50 bg-amber-500/10 ioai-dock--hint',
    error: 'border-red-500/40 bg-red-500/10',
  }

  return (
    <div className={`ioai-assessment-dock border-t-2 px-4 py-3 transition-all duration-500 ${styles[status] || styles.idle}`}>
      <div className="flex flex-wrap items-center gap-3 max-w-7xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
          Auto-grader
        </span>
        {status === 'pass' ? (
          <span className="text-sm font-bold text-emerald-400">[Pass] ✓ Checkpoint cleared — progress updated</span>
        ) : status === 'fail' ? (
          <span className="text-sm font-bold text-amber-400">{message || '[Hint] Keep going — you are close!'}</span>
        ) : status === 'error' ? (
          <span className="text-sm font-bold text-red-400">{message || 'Fix Python errors before submitting'}</span>
        ) : (
          <span className="text-sm text-slate-400">
            Write your code, then click <strong className="text-amber-300">Submit & Check</strong>
          </span>
        )}
      </div>
    </div>
  )
}
