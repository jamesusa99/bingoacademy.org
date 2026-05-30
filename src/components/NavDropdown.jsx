import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PROGRAMS, programPath } from '../config/programs'

export default function NavDropdown({ label, highlight = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const loc = useLocation()

  const isActive = PROGRAMS.some((p) => loc.pathname.startsWith(programPath(p.slug)))

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-1 ${
          isActive || highlight
            ? 'bg-cyan-500 text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
      >
        {label}
        <span className="text-[10px] opacity-70" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="absolute top-full left-0 mt-1 min-w-[240px] rounded-xl border border-slate-700 bg-[#1e293b] shadow-xl py-2 z-50">
          {PROGRAMS.map((p) => (
            <Link
              key={p.slug}
              to={programPath(p.slug)}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/10 transition"
            >
              <span className="text-lg">{p.icon}</span>
              <span>
                <span className="block text-sm font-medium text-white">{p.title}</span>
                <span className="block text-xs text-slate-400 mt-0.5">{p.audience}</span>
              </span>
            </Link>
          ))}
          <div className="border-t border-slate-700 mt-1 pt-1 px-2">
            <Link
              to="/compare"
              onClick={() => setOpen(false)}
              className="block px-2 py-2 text-xs text-cyan-400 hover:text-cyan-300"
            >
              Compare all programs →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
