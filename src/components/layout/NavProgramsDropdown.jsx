import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { programsNav } from '../../config/nav'

export default function NavProgramsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const loc = useLocation()
  const active = loc.pathname.startsWith('/programs/')

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-1 min-h-[44px] ${
          active || open ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {programsNav.label}
        <span className="text-[10px] opacity-80" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="absolute top-full left-0 mt-1 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-2 z-[60]">
          {programsNav.items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className="flex gap-3 px-4 py-3 hover:bg-white/10 transition"
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <span>
                <span className="block text-sm font-medium text-white">{item.label}</span>
                <span className="block text-xs text-slate-400 mt-0.5">{item.desc}</span>
              </span>
            </Link>
          ))}
          <div className="border-t border-slate-700 mt-1 pt-1 px-4 py-2">
            <Link to="/compare" onClick={() => setOpen(false)} className="text-xs text-cyan-400 hover:underline">
              Compare all programs →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
