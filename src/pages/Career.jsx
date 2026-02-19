import { Link } from 'react-router-dom'

export default function Career() {
  const modules = [
    { title: 'Enterprise Recruitment', desc: 'Enterprises post jobs; students apply; direct matching', to: '/career' },
    { title: 'Job List → Details → Apply', desc: 'Job postings, matching, referrals', to: '/career' },
    { title: 'Resume Optimization / AI Interview Prep', desc: 'Commission rates, share button', to: '/career' },
    { title: 'Training Projects', desc: 'Enterprise training, order-based programs; commission for teachers/institutions', to: '/career' },
    { title: 'Employment Cases', desc: 'Employment cases, salary data', to: '/career' },
  ]
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Industry-Education Integration</h1>
      <p className="text-slate-600 mb-8">Enterprise recruitment, job list, resume submission, training projects, employment cases</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((item, i) => (
          <Link key={i} to={item.to} className="card p-6 hover:shadow-md transition block">
            <h3 className="font-semibold text-primary">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500">Enterprises post jobs, partner on projects, purchase courses/tools (referral commission not open)</p>
    </div>
  )
}
