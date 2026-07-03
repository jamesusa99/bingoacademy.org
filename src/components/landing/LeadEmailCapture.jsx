import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { submitMarketingLead } from '../../lib/leadCapture'

export default function LeadEmailCapture({
  source,
  campaign,
  title,
  subtitle,
  cta,
  successMessage,
  variant = 'light',
  className = '',
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const isDark = variant === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await submitMarketingLead({ email, source, campaign })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div
        className={`rounded-2xl border p-6 text-center ${
          isDark ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'
        } ${className}`}
      >
        <p className={`text-2xl mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>✅</p>
        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-bingo-dark'}`}>
          {successMessage || 'Thanks — we will be in touch shortly.'}
        </p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-8 ${
        isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white shadow-sm'
      } ${className}`}
    >
      {title ? (
        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-bingo-dark'}`}>{title}</h3>
      ) : null}
      {subtitle ? (
        <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{subtitle}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            aria-hidden
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-primary/30 ${
              isDark
                ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-600'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-3 text-sm font-bold rounded-xl shrink-0 disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Sending…' : cta || 'Submit'}
        </button>
      </form>

      {error ? <p className="text-xs text-red-400 mt-2">{error}</p> : null}
      <p className={`text-[10px] mt-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        We respect your inbox. Unsubscribe anytime. See our{' '}
        <a href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
