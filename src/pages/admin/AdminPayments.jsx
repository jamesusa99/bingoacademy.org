import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'

function formatMoney(cents, currency = 'usd') {
  if (cents == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

export default function AdminPayments() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [o, p] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('stripe_products').select('*').order('created_at', { ascending: false }),
      ])
      setError(o.error?.message || p.error?.message || null)
      setOrders(o.data || [])
      setProducts(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        description="Stripe checkout sessions mirrored in Supabase. Configure STRIPE_SECRET_KEY and webhook /api/webhooks/stripe on Railway."
      />

      {error ? (
        <AdminAlert type="warning">
          {error.includes('does not exist')
            ? 'Run supabase/migrations/002_admin_platform.sql to create orders and stripe_products tables.'
            : error}
        </AdminAlert>
      ) : null}

      <div className="flex gap-2 mb-4">
        {['orders', 'products'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
              tab === t ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500 text-sm">Loading…</p>
        ) : tab === 'orders' ? (
          orders.length === 0 ? (
            <p className="p-6 text-slate-500 text-sm">No orders yet. They appear when Stripe webhooks fire.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100">{row.status}</span>
                    </td>
                    <td className="p-3">{formatMoney(row.amount_cents, row.currency)}</td>
                    <td className="p-3 text-slate-600">{row.customer_email || '—'}</td>
                    <td className="p-3">{row.product_name || '—'}</td>
                    <td className="p-3 text-slate-500 text-xs">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : products.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            No mirrored Stripe products. Sync from Stripe Dashboard or add rows in stripe_products.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stripe IDs</th>
                <th className="p-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {products.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3">{formatMoney(row.amount_cents, row.currency)}</td>
                  <td className="p-3 text-xs text-slate-500 font-mono">
                    {row.stripe_product_id}
                    {row.stripe_price_id ? ` / ${row.stripe_price_id}` : ''}
                  </td>
                  <td className="p-3">{row.active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
