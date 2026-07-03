import { Link } from 'react-router-dom'
import { LEGAL_COMPLIANCE } from '../../config/legalCompliance'

export default function FooterCompliance() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-gray-700">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4">
        {LEGAL_COMPLIANCE.badges.map((badge) => (
          <Link
            key={badge.id}
            to="/privacy"
            title={badge.short}
            className="inline-flex items-center gap-2 rounded-full border border-slate-600/80 bg-slate-800/50 px-3.5 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors"
          >
            <span aria-hidden>{badge.icon}</span>
            <span className="font-semibold">{badge.label}</span>
          </Link>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500 mb-4 max-w-2xl mx-auto leading-relaxed">
        {LEGAL_COMPLIANCE.footerTagline}.{' '}
        <Link to="/privacy" className="text-cyan-400/90 hover:text-cyan-300 hover:underline">
          Privacy Policy
        </Link>
      </p>
      <p className="text-center text-xs text-slate-600">
        © {new Date().getFullYear()} {LEGAL_COMPLIANCE.siteName} · Courses · Labs · Materials · Certification
      </p>
    </div>
  )
}
