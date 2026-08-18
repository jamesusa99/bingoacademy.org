import { COURSES_PORTAL } from '../../config/coursesPortal'

export default function PromoCodeInput({
  code,
  onCodeChange,
  onApply,
  onClear,
  applied,
  loading = false,
  error = null,
  theme = 'dark',
  compact = false,
  className = '',
  label,
  placeholder,
  minCheckoutRule,
}) {
  const isDark = theme === 'dark'
  const appliedOk = Boolean(applied)
  const inputClass = appliedOk
    ? isDark
      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
      : 'bg-emerald-50 border-emerald-500 text-emerald-800'
    : isDark
      ? 'bg-slate-900 border-slate-600 text-white placeholder:text-slate-500'
      : 'bg-white border-slate-300 text-bingo-dark placeholder:text-slate-400'
  const applyClass = isDark
    ? 'btn-primary'
    : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'

  return (
    <div className={className}>
      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {label || COURSES_PORTAL.promoCodeLabel}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          placeholder={placeholder || COURSES_PORTAL.promoCodePlaceholder}
          disabled={loading || appliedOk}
          readOnly={appliedOk}
          aria-invalid={Boolean(error) && !appliedOk}
          className={`flex-1 min-w-[140px] rounded-xl border px-3 py-2 text-sm font-mono uppercase font-semibold ${inputClass} ${
            appliedOk ? 'cursor-default' : ''
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (!loading && code.trim() && !appliedOk) onApply?.()
            }
          }}
        />
        {appliedOk ? (
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm border ${
              isDark
                ? 'border-emerald-600/60 text-emerald-300 hover:bg-emerald-950/50'
                : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            {COURSES_PORTAL.promoCodeRemove}
          </button>
        ) : (
          <button
            type="button"
            onClick={onApply}
            disabled={loading || !code.trim()}
            className={`px-4 py-2 rounded-xl text-sm disabled:opacity-60 ${applyClass}`}
          >
            {loading ? COURSES_PORTAL.promoCodeApplying : COURSES_PORTAL.promoCodeApply}
          </button>
        )}
      </div>
      {error ? (
        <p className={`text-xs mt-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      ) : null}
      {applied ? (
        <>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {COURSES_PORTAL.promoCodeApplied(applied.code, applied.discountLabel)}
          </p>
          {applied.minimumCheckoutApplied ? (
            <p className={`text-xs mt-1 ${isDark ? 'text-sky-300/90' : 'text-sky-700'}`}>
              {applied.minimumCheckoutNotice ||
                minCheckoutRule?.applied ||
                COURSES_PORTAL.promoCodeMinCheckoutApplied}
            </p>
          ) : null}
        </>
      ) : (
        !compact && (
          <p className={`text-[11px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {COURSES_PORTAL.promoCodeHint}
          </p>
        )
      )}
    </div>
  )
}
