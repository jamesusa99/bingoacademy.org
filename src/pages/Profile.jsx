import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { useAuth } from '../contexts/AuthContext'
import { authLink } from '../lib/authRedirect'
import {
  fetchMyProfile,
  profileDisplayName,
  maskPhone,
  formatAccountId,
} from '../lib/userProfile'
import ProfileAccountForm from '../components/ProfileAccountForm'
import ProfileAvatarEditor from '../components/profile/ProfileAvatarEditor'
import ProfileLabPacksSection from '../components/profile/ProfileLabPacksSection'
import ProfileNotificationsSection from '../components/profile/ProfileNotificationsSection'
import ProfileCertificatesSection from '../components/profile/ProfileCertificatesSection'
import ProfileAchievementsSection from '../components/profile/ProfileAchievementsSection'
import ProfileChannelSection from '../components/profile/ProfileChannelSection'
import ProfileListCollapseToggle, { useProfileListCollapse } from '../components/profile/ProfileListCollapseToggle'
import CourseAccessReset from '../components/CourseAccessReset'
import { fetchMyOrders } from '../lib/checkout'
import {
  fetchMyCertificates,
  fetchMyAchievements,
  syncLocalAccomplishments,
} from '../lib/userAccomplishments'
import { fetchMyNotifications, isNotificationUnread } from '../lib/userNotifications'
import { formatIoaiPrice } from '../lib/ioaiStore'
import {
  buildProfileOverviewCards,
  fetchMyProfileOverview,
  mergeProfileOverview,
} from '../lib/profileOverview'

// ─── Share modal (multi-channel) ────────────────────────────────────

function ShareModal({ title, onClose }) {
  const [copied, setCopied] = useState(false)
  const channels = [
    { id: 'showcase', icon: '🏆', label: 'Share to Showcase', desc: 'Display on Bingo Achievements' },
    { id: 'wechat', icon: '💬', label: 'WeChat / Friends', desc: 'Generate image or link' },
    { id: 'moments', icon: '📱', label: 'Moments / Circle', desc: 'Friends circle post' },
    { id: 'image', icon: '🖼️', label: 'Generate Image', desc: 'HD image with brand' },
    { id: 'link', icon: '🔗', label: 'Generate Link', desc: 'Short link, set expiry' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark text-sm">Share: {title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="space-y-2 mb-4">
          {channels.map(c => (
            <button key={c.id} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition text-left">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-bingo-dark text-sm">{c.label}</p>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="w-full border border-primary text-primary py-2 rounded-xl text-sm font-medium hover:bg-primary/5 transition"
        >
          {copied ? '✓ Link copied' : 'Copy share link'}
        </button>
      </div>
    </div>
  )
}


// ─── Main Profile ──────────────────────────────────────────────────

function scrollToProfileSection(id = 'settings') {
  const headerOffset = 120

  const attempt = (retriesLeft) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      return
    }
    if (retriesLeft > 0) {
      requestAnimationFrame(() => attempt(retriesLeft - 1))
    }
  }

  requestAnimationFrame(() => attempt(24))
}

const ORDER_STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
  canceled: 'Canceled',
}

function formatOrderDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function ProfileOrdersSection({ orders, loading, error }) {
  const { visible, collapsible, expanded, hiddenCount, toggle } = useProfileListCollapse(orders)

  return (
    <section id="orders" className="mb-8 scroll-mt-28">
      <h2 className="section-title mb-4">My Orders</h2>
      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading orders…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : orders.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-slate-600">No orders yet.</p>
            <p className="text-xs text-slate-500 mt-2">
              Course purchases appear here after checkout completes.
            </p>
            <Link to="/courses/ioai" className="text-sm text-primary font-medium hover:underline mt-3 inline-block">
              Browse courses →
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((order) => {
                  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status || '—'
                  const amount =
                    order.amount_cents != null
                      ? formatIoaiPrice(order.amount_cents, order.currency || 'usd')
                      : '—'
                  const productName =
                    order.product_name ||
                    order.metadata?.product_name ||
                    order.metadata?.course_slug ||
                    'Course purchase'
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatOrderDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-bingo-dark font-medium">{productName}</td>
                      <td className="py-3 px-4 text-slate-700">{amount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            order.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
            <ProfileListCollapseToggle
              collapsible={collapsible}
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="orders"
            />
          </>
        )}
      </div>
    </section>
  )
}

export default function Profile() {
  const location = useLocation()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false)
  const [shareModal, setShareModal] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState('')
  const [certificates, setCertificates] = useState([])
  const [certificatesLoading, setCertificatesLoading] = useState(true)
  const [certificatesError, setCertificatesError] = useState('')
  const [achievements, setAchievements] = useState([])
  const [achievementsLoading, setAchievementsLoading] = useState(true)
  const [achievementsError, setAchievementsError] = useState('')
  const [overview, setOverview] = useState(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    let mounted = true
    setProfileLoading(true)
    setProfileError('')

    fetchMyProfile(user.id).then(({ data, error }) => {
      if (!mounted) return
      if (error) setProfileError(error.message)
      else setProfile(data)
      setProfileLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [user?.id])

  const refreshOverview = useCallback(async () => {
    if (!isAuthenticated) {
      setOverview(null)
      setOverviewLoading(false)
      return
    }

    setOverviewLoading(true)
    try {
      const { overview: serverOverview } = await fetchMyProfileOverview()
      setOverview(mergeProfileOverview(serverOverview))
    } catch {
      setOverview(mergeProfileOverview(null))
    } finally {
      setOverviewLoading(false)
    }
  }, [isAuthenticated])

  const loadNotifications = useCallback(() => {
    if (!user?.id) {
      setNotifications([])
      setNotificationsLoading(false)
      return Promise.resolve()
    }

    setNotificationsLoading(true)
    setNotificationsError('')

    return fetchMyNotifications(user.id)
      .then(({ data, error }) => {
        if (error) {
          setNotificationsError(error.message || 'Failed to load notifications')
          setNotifications([])
        } else {
          setNotifications(data || [])
        }
      })
      .finally(() => {
        setNotificationsLoading(false)
      })
  }, [user?.id])

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([])
      setOrdersLoading(false)
      return
    }

    let mounted = true
    setOrdersLoading(true)
    setOrdersError('')

    fetchMyOrders()
      .then(({ orders: rows }) => {
        if (!mounted) return
        setOrders(rows || [])
      })
      .catch((err) => {
        if (!mounted) return
        setOrdersError(err.message || 'Failed to load orders')
        setOrders([])
      })
      .finally(() => {
        if (mounted) {
          setOrdersLoading(false)
          refreshOverview()
          loadNotifications()
        }
      })

    return () => {
      mounted = false
    }
  }, [isAuthenticated, user?.id, refreshOverview, loadNotifications])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setNotificationsLoading(false)
      return
    }

    let mounted = true
    loadNotifications().then(() => {
      if (!mounted) return
    })

    return () => {
      mounted = false
    }
  }, [isAuthenticated, loadNotifications])

  const loadAccomplishments = useCallback(async () => {
    if (!user?.id) {
      setCertificates([])
      setAchievements([])
      setCertificatesLoading(false)
      setAchievementsLoading(false)
      return
    }

    setCertificatesLoading(true)
    setAchievementsLoading(true)
    setCertificatesError('')
    setAchievementsError('')

    await syncLocalAccomplishments(user.id)

    const [certResult, achResult] = await Promise.all([
      fetchMyCertificates(user.id),
      fetchMyAchievements(user.id),
    ])

    if (certResult.error) {
      setCertificatesError(certResult.error.message || 'Failed to load certificates')
      setCertificates([])
    } else {
      setCertificates(certResult.data || [])
    }

    if (achResult.error) {
      setAchievementsError(achResult.error.message || 'Failed to load achievements')
      setAchievements([])
    } else {
      setAchievements(achResult.data || [])
    }

    setCertificatesLoading(false)
    setAchievementsLoading(false)

    await refreshOverview()
    await loadNotifications()
  }, [user?.id, refreshOverview, loadNotifications])

  useEffect(() => {
    if (!isAuthenticated) {
      setCertificates([])
      setAchievements([])
      setCertificatesLoading(false)
      setAchievementsLoading(false)
      return
    }

    loadAccomplishments()
  }, [isAuthenticated, loadAccomplishments])

  const unreadNotificationCount = useMemo(() => {
    if (notificationsLoading || notificationsError) return 0
    return notifications.filter((n) => isNotificationUnread(n)).length
  }, [notifications, notificationsLoading, notificationsError])

  const dataCards = useMemo(
    () => buildProfileOverviewCards(overview || mergeProfileOverview(null)),
    [overview]
  )

  const toggleAccountSettings = useCallback(() => {
    setAccountSettingsOpen((open) => !open)
  }, [])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    const hash = location.hash.replace('#', '')
    if (hash === 'settings') {
      setAccountSettingsOpen(true)
      const timer = window.setTimeout(() => scrollToProfileSection('settings'), 80)
      return () => window.clearTimeout(timer)
    }
    if (hash === 'orders' || hash === 'notifications' || hash === 'certificates' || hash === 'achievements' || hash === 'progress' || hash === 'support' || hash === 'promo') {
      const timer = window.setTimeout(() => scrollToProfileSection(hash), 80)
      return () => window.clearTimeout(timer)
    }
  }, [location.hash, authLoading, isAuthenticated, profileLoading, ordersLoading, notificationsLoading, certificatesLoading, achievementsLoading])

  if (authLoading) {
    return (
      <div className="page-content w-full py-16 text-center text-slate-500 text-sm">Loading…</div>
    )
  }

  if (!isAuthenticated) {
    const profileReturn = location.hash ? `/profile${location.hash}` : '/profile'
    return <Navigate to={authLink('/login', profileReturn)} replace />
  }

  const displayName = profileDisplayName(profile, user)
  const displayPhone = maskPhone(profile?.phone)
  const accountId = formatAccountId(user?.id)
  const userEmail = profile?.email || user?.email || ''

  const coreLinks = [
    { to: '/profile/study', icon: '📚', label: 'My Courses', share: false },
    { to: '/profile/works', icon: '🎨', label: 'My Works', share: true },
    { to: '/profile#orders', icon: '📦', label: 'My Orders', share: true },
    { to: '/profile#certificates', icon: '📜', label: 'My Certificates', share: true },
    { to: '/profile#achievements', icon: '🏅', label: 'My Achievements', share: true },
    { to: '/profile#notifications', icon: '🔔', label: 'Notifications', share: false, badge: unreadNotificationCount },
  ]

  return (
    <div className="page-content w-full py-6 sm:py-8">
      <PageMeta title="My Profile | Bingo Academy" noindex />
      {shareModal && <ShareModal title={shareModal} onClose={() => setShareModal(null)} />}

      {/* ── Top bar ─────────────────────────────────── */}
      <section className="mb-8">
        <div className="card p-6 flex flex-wrap items-center gap-4">
          <ProfileAvatarEditor userId={user.id} profile={profile} user={user} onSaved={setProfile} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-bingo-dark">
              {profileLoading ? 'Loading…' : displayName}
              {displayPhone ? <span className="text-slate-500 font-normal"> · {displayPhone}</span> : null}
            </div>
            <div className="text-sm text-slate-500">Account ID: {accountId}</div>
            {profileError ? (
              <p className="text-xs text-red-600 mt-1">{profileError}</p>
            ) : null}
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={toggleAccountSettings}
              className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50"
              aria-expanded={accountSettingsOpen}
              aria-controls="settings"
            >
              {accountSettingsOpen ? 'Close' : 'Edit profile'}
            </button>
          </div>
        </div>
        {accountSettingsOpen ? (
          <div id="settings" className="card p-6 mt-3 scroll-mt-28">
            {profileLoading ? (
              <p className="text-sm text-slate-500">Loading account info…</p>
            ) : profile ? (
              <ProfileAccountForm
                userId={user.id}
                profile={profile}
                userEmail={userEmail}
                onSaved={setProfile}
              />
            ) : (
              <p className="text-sm text-slate-600">
                No profile found. Try signing in again, or contact support if the problem continues.
              </p>
            )}
            <CourseAccessReset />
          </div>
        ) : null}
      </section>

      {/* ── Core function grid (with share hints) ───────────────────── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Quick access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {coreLinks.map((item, i) => (
            <div key={i} className="relative">
              {item.to ? (
                <Link
                  to={item.to}
                  className={`card p-4 text-center hover:shadow-md transition block ${item.highlight ? 'border-amber-300 bg-amber-50/30' : ''}`}
                >
                  {item.share && (
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); setShareModal(item.label) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] hover:bg-amber-500"
                      title="Share"
                    >
                      ↗
                    </button>
                  )}
                  {item.badge > 0 ? (
                    <span className="absolute top-2 left-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <span className="text-xs font-medium text-bingo-dark">{item.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.action}
                  className={`w-full card p-4 text-center hover:shadow-md transition ${item.highlight ? 'border-amber-300 bg-amber-50/30' : ''}`}
                >
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <span className="text-xs font-medium text-bingo-dark">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Data overview + share entry ─────────────────────────────── */}
      <section id="progress" className="mb-8 scroll-mt-28">
        <h2 className="section-title mb-4">Overview</h2>
        {overviewLoading ? (
          <p className="text-sm text-slate-500 mb-3">Loading overview…</p>
        ) : null}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {dataCards.map((card, i) => (
            <div key={i} className="card p-4 relative">
              <p className="text-xs text-slate-500 mb-0.5">{card.label}</p>
              <p className="font-bold text-bingo-dark text-lg">{card.value} <span className="text-xs font-normal text-slate-400">{card.unit}</span></p>
              {card.shareModule && (
                <button
                  type="button"
                  onClick={() => setShareModal(card.shareModule)}
                  className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  More share options →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <ProfileLabPacksSection />

      <ProfileChannelSection />

      {/* ── My Orders ─────────────────────────────────────────────── */}
      <ProfileOrdersSection orders={orders} loading={ordersLoading} error={ordersError} />

      {/* ── My Certificates ───────────────────────────────────────── */}
      <ProfileCertificatesSection
        certificates={certificates}
        loading={certificatesLoading}
        error={certificatesError}
      />

      {/* ── My Achievements ───────────────────────────────────────── */}
      <ProfileAchievementsSection
        achievements={achievements}
        loading={achievementsLoading}
        error={achievementsError}
      />

      {/* ── Notifications ─────────────────────────────────────────── */}
      <ProfileNotificationsSection
        notifications={notifications}
        loading={notificationsLoading}
        error={notificationsError}
        userId={user?.id}
        onRefresh={loadNotifications}
      />

      {/* ── Bottom quick area ──────────────────────────────────────── */}
      <section id="support" className="border-t border-slate-200 pt-6 scroll-mt-28">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/profile/study" className="text-slate-600 hover:text-primary">Study Center</Link>
            <Link to="/profile#notifications" className="text-slate-600 hover:text-primary">Notifications</Link>
            <Link to="/safety-and-privacy" className="text-slate-600 hover:text-primary">Help & safety</Link>
            <a href="mailto:support@bingoacademy.org" className="text-slate-600 hover:text-primary">Contact support</a>
          </div>
          <p className="text-xs text-slate-400">Bingo Academy · Profile</p>
        </div>
      </section>
    </div>
  )
}
