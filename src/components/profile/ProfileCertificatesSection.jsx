import { Link } from 'react-router-dom'
import { formatAccomplishmentDate } from '../../lib/userAccomplishments'

const SOURCE_LABELS = {
  assessment: 'Assessment',
  course: 'Course',
  purchase: 'Purchase',
  system: 'Academy',
}

export default function ProfileCertificatesSection({ certificates, loading, error }) {
  return (
    <section id="certificates" className="mb-8 scroll-mt-28">
      <div className="mb-4">
        <h2 className="section-title mb-1">My Certificates</h2>
        <p className="text-sm text-slate-500">Capability certificates earned from assessments, courses, and purchases</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading certificates…</p>
        ) : error ? (
          <div className="p-6">
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-slate-500 mt-2">
              Run migration <code className="text-[11px]">033_user_certs_achievements.sql</code> in Supabase if needed.
            </p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-slate-600">No certificates yet.</p>
            <p className="text-xs text-slate-500 mt-2">
              Complete an AI placement assessment (60%+ earns a capability certificate) or finish cert-eligible courses.
            </p>
            <Link to="/assessment" className="text-sm text-primary font-medium hover:underline mt-3 inline-block">
              Take an assessment →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-2xl shrink-0">
                  📜
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-bingo-dark text-sm">{cert.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {SOURCE_LABELS[cert.source] || cert.source}
                    </span>
                  </div>
                  {cert.subtitle ? <p className="text-sm text-slate-600">{cert.subtitle}</p> : null}
                  {cert.level_label ? (
                    <p className="text-xs text-emerald-700 font-medium mt-1">Level: {cert.level_label}</p>
                  ) : null}
                  <p className="text-xs text-slate-400 mt-2">
                    Issued {formatAccomplishmentDate(cert.issued_at)} · {cert.issuer || 'Bingo AI Academy'}
                  </p>
                  {cert.verify_code ? (
                    <p className="text-xs text-slate-500 mt-1 font-mono">Verify: {cert.verify_code}</p>
                  ) : null}
                </div>
                {cert.href ? (
                  <Link
                    to={cert.href}
                    className="text-xs font-semibold text-primary hover:underline shrink-0 self-start sm:self-center"
                  >
                    View →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
