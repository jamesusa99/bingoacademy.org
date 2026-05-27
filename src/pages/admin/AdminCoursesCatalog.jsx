import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'

export default function AdminCoursesCatalog() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: e } = await supabase
        .from('courses_catalog')
        .select('slug, line, status, name, price, badge, featured, sort_order')
        .order('sort_order')
      setError(e?.message || null)
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <AdminPageHeader
        title="Course catalogue"
        description="Full course catalog (IOAI, general, K12) imported from frontend config. Run npm run seed or Platform → Import site data if empty."
      />

      {error ? (
        <AdminAlert type="warning">
          {error.includes('does not exist')
            ? 'Run supabase/migrations/007_courses_catalog_portfolio.sql then npm run seed'
            : error}
        </AdminAlert>
      ) : null}

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No courses. Use Platform settings → Import site data.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Line</th>
                <th className="p-3">Status</th>
                <th className="p-3">Price</th>
                <th className="p-3">Slug</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.slug} className="border-t border-slate-100">
                  <td className="p-3 font-medium">
                    {row.name}
                    {row.featured ? <span className="ml-1 text-xs text-amber-600">★</span> : null}
                  </td>
                  <td className="p-3 capitalize">{row.line}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3 text-slate-600">{row.price || '—'}</td>
                  <td className="p-3 text-xs font-mono text-slate-400">{row.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
