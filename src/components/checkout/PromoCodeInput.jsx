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
  const inputClass = isDark
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
          disabled={loading}
          className={`flex-1 min-w-[140px] rounded-xl border px-3 py-2 text-sm font-mono uppercase ${inputClass}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (!loading && code.trim() && !applied) onApply?.()
            }
          }}
        />
        {applied ? (
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm border ${
              isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
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
            <p className={`text-xs mt-1 ${isDark ? 'text-amber-300/90' : 'text-amber-700'}`}>
              {minCheckoutRule?.applied || COURSES_PORTAL.promoCodeMinCheckoutApplied}
            </p>
          ) : null}
        </>
      ) : (
        (minCheckoutRule?.hint || !compact) && (
          <p className={`text-[11px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {minCheckoutRule?.hint || COURSES_PORTAL.promoCodeHint}
          </p>
        )
      )}
    </div>
  )
}
