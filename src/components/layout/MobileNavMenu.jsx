import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { guestNavTo, isGuestNavActive } from '../../config/guestNav'
import { studentNavTo, isStudentNavActive } from '../../config/studentNav'

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   items: Array<{ label: string, path?: string, hash?: string }>,
 *   variant: 'guest' | 'student',
 *   onSignOut?: () => void,
 * }} props
 */
export default function MobileNavMenu({ open, onClose, items, variant, onSignOut }) {
  const loc = useLocation()

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const isActive = variant === 'student' ? isStudentNavActive : isGuestNavActive
  const navTo = variant === 'student' ? studentNavTo : guestNavTo

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute top-0 right-0 h-full w-[min(100%,20rem)] bg-[#0f172a] border-l border-cyan-500/20 shadow-2xl flex flex-col pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold text-white">Menu</p>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActive(loc, item)
              return (
                <li key={item.label}>
                  <Link
                    to={navTo(item)}
                    onClick={onClose}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors min-h-[44px] ${
                      active ? 'bg-cyan-500 text-slate-900' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        {variant === 'student' && onSignOut ? (
          <div className="px-3 py-4 border-t border-white/10 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                onClose()
                onSignOut()
              }}
              className="w-full px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/10 min-h-[44px]"
            >
              Sign Out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
