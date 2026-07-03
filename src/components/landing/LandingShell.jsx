import { Link } from 'react-router-dom'
import FooterCompliance from '../layout/FooterCompliance'

/**
 * Minimal chrome for paid/organic landing pages — logo only, no main nav distraction.
 */
export default function LandingShell({ children, variant = 'dark', className = '' }) {
  const isDark = variant === 'dark'

  return (
    <div
      className={`min-h-screen flex flex-col ${isDark ? 'bg-[#050810] text-slate-100' : 'bg-white text-slate-900'} ${className}`}
    >
      <header
        className={`shrink-0 border-b px-4 sm:px-6 py-3 ${
          isDark ? 'border-white/10 bg-slate-950/90 backdrop-blur' : 'border-slate-200 bg-white/95 backdrop-blur'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Bingo AI Academy" className="h-8 w-auto opacity-90" width={895} height={209} />
          </Link>
          <Link
            to="/privacy"
            className={`text-xs font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Privacy
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">{children}</main>

      <footer className={isDark ? 'shrink-0' : 'shrink-0 border-t border-slate-200'}>
        {isDark ? (
          <FooterCompliance />
        ) : (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Bingo AI Academy ·{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        )}
      </footer>
    </div>
  )
}
