import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { mainNav, authNav } from '../config/nav'
import { programPath } from '../config/programs'
import NavDropdown from './NavDropdown'
import ChatWidget from './ChatWidget'

function navLinkClass(active) {
  if (active) return 'bg-cyan-500 text-white'
  return 'text-slate-300 hover:text-white hover:bg-white/10'
}

function isNavActive(loc, path) {
  if (path === '/profile') return loc.pathname.startsWith('/profile')
  if (path === '/labs') return loc.pathname === '/labs' || loc.pathname === '/lab'
  if (path === '/exploration') {
    return loc.pathname === '/exploration' || loc.pathname.startsWith('/exploration/')
  }
  if (path === '/courses') return loc.pathname.startsWith('/courses')
  return loc.pathname === path
}

export default function Layout({ children }) {
  const loc = useLocation()

  const desktopItems = [
    { type: 'link', path: '/', label: 'Home' },
    { type: 'programs', label: 'Programs' },
    { type: 'link', path: '/courses', label: 'Courses' },
    { type: 'link', path: '/labs', label: 'Labs' },
    { type: 'link', path: '/exploration', label: 'AI Exploration' },
    { type: 'sep' },
    { type: 'link', path: '/compare', label: 'Compare' },
    { type: 'link', path: '/showcase', label: 'Achievements' },
    { type: 'link', path: '/cert', label: 'Pricing' },
    { type: 'link', path: '/community', label: 'Community' },
    { type: 'sep' },
    { type: 'link', path: '/mall', label: 'AI Mall' },
    { type: 'link', path: '/profile', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-bingo-dark text-white shadow-lg border-b border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b] pt-[env(safe-area-inset-top)]">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:gap-4 min-h-14">
            <Link to="/" className="shrink-0 flex items-center" aria-label="BingoAcademy home">
              <img src="/logo.png" alt="BingoAcademy" className="h-9 sm:h-10 w-auto" width={895} height={209} />
            </Link>
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0" aria-label="Main">
              {desktopItems.map((item, i) => {
                if (item.type === 'sep') {
                  return <span key={`sep-${i}`} className="w-0.5 h-5 bg-cyan-400/80 shrink-0 rounded-full" aria-hidden />
                }
                if (item.type === 'programs') {
                  return <NavDropdown key="programs" label={item.label} />
                }
                const active = isNavActive(loc, item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${navLinkClass(active)}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {authNav.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${navLinkClass(isNavActive(loc, path))}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <nav className="lg:hidden nav-scroll-mobile pb-2" aria-label="Mobile navigation">
            {mainNav.map(({ path, label }) => (
              <Link
                key={path + label}
                to={path}
                className={`px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 min-h-[44px] inline-flex items-center ${
                  isNavActive(loc, path) ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-200'
                }`}
              >
                {label}
              </Link>
            ))}
            {authNav.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 ${
                  isNavActive(loc, path) ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-200'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
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
            <p className="mt-2 text-slate-500">Foundations of AI · IOAI Training · K12 Classroom</p>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="text-white font-medium mb-2">Explore</div>
              <Link to="/courses" className="block hover:text-white">Courses</Link>
              <Link to="/labs" className="block hover:text-white">Labs & kits</Link>
              <Link to="/exploration" className="block hover:text-white">AI Exploration (free games)</Link>
              <Link to="/compare" className="block hover:text-white">Compare Programs</Link>
              <Link to="/showcase" className="block hover:text-white">Achievements</Link>
              <Link to="/cert" className="block hover:text-white">Pricing & Certification</Link>
              <Link to="/mall" className="block hover:text-white">AI Mall</Link>
            </div>
            <div>
              <div className="text-white font-medium mb-2">Programs</div>
              <Link to={programPath('ioai')} className="block hover:text-white">IOAI Competition</Link>
              <Link to={programPath('foundations')} className="block hover:text-white">Foundations of AI</Link>
              <Link to={programPath('k12')} className="block hover:text-white">K12 School Edition</Link>
              <Link to="/admin" className="block hover:text-white text-slate-500 mt-2">Admin</Link>
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
