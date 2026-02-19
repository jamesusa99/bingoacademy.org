import { Link, useLocation } from 'react-router-dom'

const subNav = [
  { path: '/mall', label: 'AI Mall' },
  { path: '/mall/materials', label: 'Materials Center' },
]
const tabs = [
  { key: 'book', name: 'Books', desc: 'Course materials, competition prep, AI literacy, admissions guides' },
  { key: 'tool', name: 'Teaching Tools', desc: 'AI lab tools, coding tools, experiment kits, supplies' },
  { key: 'kit', name: 'Tool Kits', desc: 'Coding kits, competition prep kits, course bundles' },
]
export default function Materials() {
  const loc = useLocation()
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-bingo-dark">AI Mall</h1>
        {subNav.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              loc.pathname === path ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <h2 className="text-xl font-semibold text-bingo-dark mb-2">Materials Center</h2>
      <p className="text-gray-600 mb-8">Materials, tools, and kits in one place; share for 8%-12% commission</p>

      <section className="mb-8">
        <h2 className="section-title">Categories</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {tabs.map((t) => (
            <div key={t.key} className="card p-6">
              <h3 className="font-semibold text-primary">{t.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{t.desc}</p>
              <p className="text-xs text-primary mt-3">Add to cart · Purchase · Bulk buy · Some tools rentable</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 bg-indigo-50/50 border-primary/20">
        <h3 className="font-semibold text-primary">Promotions</h3>
        <p className="text-sm text-gray-600 mt-1">Limited-time discounts, bundle deals, points redemption, trade-in; share for coupons and commission</p>
      </section>
    </div>
  )
}
