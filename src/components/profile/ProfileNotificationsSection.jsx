import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  NOTIFICATION_CATEGORIES,
  formatNotificationTime,
  isNotificationUnread,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../lib/userNotifications'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order', label: 'Orders' },
  { id: 'course', label: 'Courses' },
  { id: 'announcement', label: 'Announcements' },
]

function NotificationRow({ item, onOpen }) {
  const meta = NOTIFICATION_CATEGORIES[item.category] || NOTIFICATION_CATEGORIES.system
  const unread = isNotificationUnread(item)
  const Wrapper = item.href ? Link : 'button'
  const wrapperProps = item.href
    ? { to: item.href, onClick: () => onOpen(item) }
    : { type: 'button', onClick: () => onOpen(item) }

  return (
    <Wrapper
      {...wrapperProps}
      className={`w-full text-left flex gap-3 p-4 transition hover:bg-slate-50/80 ${
        unread ? 'bg-cyan-50/40' : ''
      }`}
    >
      <span className="text-xl shrink-0 mt-0.5" aria-hidden>
        {meta.icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className={`font-semibold text-sm ${unread ? 'text-bingo-dark' : 'text-slate-700'}`}>
            {item.title}
          </span>
          {unread ? (
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              New
            </span>
          ) : null}
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">{meta.label}</span>
        </span>
        {item.body ? <p className="text-sm text-slate-600 line-clamp-2">{item.body}</p> : null}
        <span className="text-xs text-slate-400 mt-1 block">{formatNotificationTime(item.created_at)}</span>
      </span>
      {item.href ? (
        <span className="text-slate-300 shrink-0 self-center" aria-hidden>
          →
        </span>
      ) : null}
    </Wrapper>
  )
}

export default function ProfileNotificationsSection({
  notifications,
  loading,
  error,
  userId,
  onRefresh,
}) {
  const [filter, setFilter] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const unreadCount = useMemo(
    () => notifications.filter((n) => isNotificationUnread(n)).length,
    [notifications]
  )

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => isNotificationUnread(n))
    if (filter === 'all') return notifications
    return notifications.filter((n) => n.category === filter)
  }, [notifications, filter])

  const handleOpen = async (item) => {
    if (!userId || !isNotificationUnread(item)) return
    setBusyId(item.id)
    await markNotificationRead(userId, item.id)
    setBusyId(null)
    onRefresh?.()
  }

  const handleMarkAllRead = async () => {
    if (!userId || unreadCount === 0) return
    setMarkingAll(true)
    await markAllNotificationsRead(userId)
    setMarkingAll(false)
    onRefresh?.()
  }

  return (
    <section id="notifications" className="mb-8 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="section-title mb-1">Notifications</h2>
          <p className="text-sm text-slate-500">
            Order updates, course unlocks, and academy announcements
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
          >
            {markingAll ? 'Updating…' : 'Mark all as read'}
          </button>
        ) : null}
      </div>

      <div className="card overflow-hidden">
        <div className="flex gap-2 p-3 border-b border-slate-100 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === f.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading notifications…</p>
        ) : error ? (
          <div className="p-6">
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-slate-500 mt-2">
              If this is your first visit, run migration{' '}
              <code className="text-[11px]">032_user_notifications.sql</code> in Supabase.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-600">
              {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
            </p>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
              You will see payment confirmations, course unlock alerts, and platform announcements here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div key={item.id} className={busyId === item.id ? 'opacity-60' : ''}>
                <NotificationRow item={item} onOpen={handleOpen} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
