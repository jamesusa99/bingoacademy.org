import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import { ADMIN_DASHBOARD_CARDS, ADMIN_DASHBOARD_QUICK_LINKS } from '../../config/adminNav'

export default function AdminDashboard() {
  const { t } = useAdminLocale()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [c, th, sc, ct, mc, mp, cm, vid, ord, prof] = await Promise.all([
          supabase.from('courses_catalog').select('id', { count: 'exact', head: true }),
          supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
          supabase.from('showcase_cases').select('id', { count: 'exact', head: true }),
          supabase.from('cert_tiers').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('mall_products').select('id', { count: 'exact', head: true }),
          supabase.from('community_mentors').select('id', { count: 'exact', head: true }),
          supabase.from('video_assets').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ])
        setStats({
          courses: c.count ?? 0,
          threads: th.count ?? 0,
          showcase: sc.count ?? 0,
          cert: ct.count ?? 0,
          mall: (mc.count ?? 0) + (mp.count ?? 0),
          mentors: cm.count ?? 0,
          videos: vid.count ?? 0,
          orders: ord.count ?? 0,
          users: prof.count ?? 0,
        })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">{t('dashboard.title')}</h1>

      {loading ? (
        <div className="card p-8 text-center text-slate-500">{t('dashboard.loading')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {ADMIN_DASHBOARD_CARDS.map((c) => (
            <Link key={c.to} to={c.to} className={`card p-5 border-2 ${c.color} hover:shadow-md transition`}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{c.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-bingo-dark">
                    {c.statKey ? (stats[c.statKey] ?? 0) : '—'}
                  </div>
                  <div className="text-sm text-slate-500">{t(c.labelKey)}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">{t('dashboard.manage')}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-bingo-dark mb-3">{t('dashboard.quickLinks')}</h2>
        <div className="flex flex-wrap gap-2">
          {ADMIN_DASHBOARD_QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={link.className}>
              {t(link.labelKey)}
            </Link>
          ))}
          <Link
            to="/"
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm"
          >
            {t('dashboard.viewSite')}
          </Link>
        </div>
      </div>
    </div>
  )
}
