import { Link, useLocation } from 'react-router-dom'

const subNav = [
  { path: '/mall', label: 'AI Mall' },
  { path: '/mall/materials', label: 'Materials Center' },
]

export default function Mall() {
  const loc = useLocation()
  const items = [
    { title: 'Own Products', desc: 'Books, AI teaching tools, course packages, certification materials' },
    { title: 'Custom Products', desc: 'Custom AI courses, tools, learning tools via OEM' },
    { title: 'Bundle Packages', desc: 'Course + materials + tools in one, higher value' },
    { title: 'Member discounts, flash sales, promotions', desc: '' },
  ]
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-bingo-dark">AI Mall</h1>
        {subNav.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              loc.pathname === path ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <p className="text-slate-600 mb-6">Browse (courses/materials/tools/tutoring) → List → Details (commission + share) → Cart → Checkout. Bundles, member prices, flash sales, group buy, promotions; referral commission doubled; share orders auto-bind referrer</p>
      <div className="mb-6">
        <Link to="/mall/materials" className="btn-primary">Materials Center →</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="card p-6">
            <h3 className="font-semibold text-primary">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
