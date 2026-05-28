import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { mainNavPrimary, mainNavSecondary, authNav } from '../config/nav'
import NavProgramsDropdown from './layout/NavProgramsDropdown'
import ChatWidget from './ChatWidget'

function navLinkClass(active, highlight) {
  if (active) return 'bg-cyan-500 text-white'
  if (highlight) return 'text-violet-300 hover:text-white hover:bg-violet-500/30'
  return 'text-slate-300 hover:text-white hover:bg-white/10'
}

export default function Layout({ children }) {
  const loc = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (path) => {
    if (path === '/') return loc.pathname === '/'
    if (path === '/lab') return loc.pathname === '/lab' || loc.pathname.startsWith('/lab/')
    if (path === '/exploration') return loc.pathname === '/exploration'
    return loc.pathname === path || loc.pathname.startsWith(`${path}/`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-bingo-dark text-white shadow-lg border-b border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b] pt-[env(safe-area-inset-top)]">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:gap-4 min-h-14">
            <Link to="/" className="shrink-0 flex items-center" aria-label="BingoAcademy home">
              <img src="/logo.png" alt="BingoAcademy" className="h-9 sm:h-10 w-auto" width={895} height={209} />
            </Link>

            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0">
              <NavProgramsDropdown />
              {mainNavPrimary
                .filter((n) => !n.items)
                .map(({ path, label, highlight }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap transition-colors min-h-[44px] inline-flex items-center ${navLinkClass(isActive(path), highlight)}`}
                  >
                    {label}
                  </Link>
                ))}
              <span className="w-0.5 h-5 bg-cyan-400/80 shrink-0 rounded-full mx-1" aria-hidden />
              {mainNavSecondary.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${navLinkClass(isActive(path))}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <Link
                to="/profile"
                className={`px-2 py-2 rounded-lg text-sm ${navLinkClass(loc.pathname.startsWith('/profile'))}`}
              >
                Profile
              </Link>
              {authNav.map(({ path, label }) => (
                <Link key={path} to={path} className={`px-3 py-2 rounded-lg text-sm ${navLinkClass(isActive(path))}`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <nav className="lg:hidden nav-scroll-mobile pb-2" aria-label="Mobile navigation">
            <NavProgramsDropdown />
            {mainNavPrimary
              .filter((n) => !n.items)
              .map(({ path, label, highlight }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 ${
                    isActive(path) ? 'bg-cyan-500 text-white' : highlight ? 'bg-violet-500/40 text-violet-100' : 'bg-white/10 text-slate-200'
                  }`}
                >
                  {label}
                </Link>
              ))}
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="px-3 py-2 text-xs rounded-lg bg-white/10 text-slate-200 shrink-0"
            >
              More ▾
            </button>
            {authNav.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 text-xs rounded-lg whitespace-nowrap ${isActive(path) ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-200'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          {moreOpen ? (
            <div className="lg:hidden flex flex-wrap gap-2 pb-3">
              {mainNavSecondary.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMoreOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/10 text-slate-200"
                >
                  {label}
                </Link>
              ))}
              <Link to="/compare" onClick={() => setMoreOpen(false)} className="px-3 py-1.5 text-xs rounded-lg bg-white/10 text-slate-200">
                Compare
              </Link>
            </div>
          ) : null}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-bingo-dark text-slate-400 text-sm py-8 border-t border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between gap-6">
          <div>
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="BingoAcademy"
                className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                width={895}
                height={209}
              />
            </Link>
            <p className="mt-2 text-xs">AI courses, labs & certification</p>
          </div>
          <div className="flex flex-wrap gap-8">
            <div>
              <div className="text-white font-medium mb-2">Programs</div>
              <Link to="/programs/ioai" className="block hover:text-white">IOAI Competition Training</Link>
              <Link to="/programs/foundations" className="block hover:text-white">Foundations of AI Program</Link>
              <Link to="/programs/k12" className="block hover:text-white">K12 Classroom Edition</Link>
              <Link to="/compare" className="block hover:text-white mt-2">Compare programs</Link>
            </div>
            <div>
              <div className="text-white font-medium mb-2">Explore</div>
              <Link to="/courses" className="block hover:text-white">Courses</Link>
              <Link to="/exploration" className="block hover:text-white">AI Exploration Lab</Link>
              <Link to="/lab" className="block hover:text-white">Labs</Link>
              <Link to="/showcase" className="block hover:text-white">Achievements</Link>
              <Link to="/cert" className="block hover:text-white">Certification</Link>
              <Link to="/mall" className="block hover:text-white">AI Mall</Link>
              <Link to="/pricing" className="block hover:text-white">Pricing</Link>
            </div>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6 mt-6 pt-6 border-t border-gray-700 text-center">
          Courses · Labs · Materials · Certification
        </div>
      </footer>
      <ChatWidget />
    </div>
  )
}
