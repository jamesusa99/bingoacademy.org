import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { mainNav, authNav } from '../config/nav'
import { programPath } from '../config/programs'
import { useAuth } from '../contexts/AuthContext'
import { ProductLineVisibilityProvider, useProductLineVisibility } from '../contexts/ProductLineVisibilityContext'
import { authLink } from '../lib/authRedirect'
import NavDropdown from './NavDropdown'
import ChatWidget from './ChatWidget'
import { LABS_STOREFRONT_VISIBLE, isLabsNavPath } from '../config/labsStorefront'

function navLinkClass(active) {
  if (active) return 'bg-cyan-500 text-white'
  return 'text-slate-300 hover:text-white hover:bg-white/10'
}

function isNavActive(loc, path) {
  if (path === '/profile') {
    if (loc.pathname.startsWith('/profile/study')) return false
    return loc.pathname === '/profile' || loc.pathname.startsWith('/profile/')
  }
  if (path === '/profile/study') return loc.pathname.startsWith('/profile/study')
  if (path === '/curriculum') return loc.pathname === '/curriculum'
  if (path === '/labs') {
    return loc.pathname === '/labs' || loc.pathname === '/lab' || loc.pathname.startsWith('/labs/')
  }
  if (path === '/exploration') {
    return loc.pathname === '/exploration' || loc.pathname.startsWith('/exploration/')
  }
  if (path === '/courses') return loc.pathname.startsWith('/courses')
  return loc.pathname === path
}

export default function Layout({ children }) {
  return (
    <ProductLineVisibilityProvider>
      <LayoutShell>{children}</LayoutShell>
    </ProductLineVisibilityProvider>
  )
}

function LayoutShell({ children }) {
  const loc = useLocation()
  const { isAuthenticated, loading: authLoading, signOut } = useAuth()
  const { visiblePrograms } = useProductLineVisibility()
  const showGuestNav = !authLoading && !isAuthenticated
  const visibleProgramPaths = new Set(visiblePrograms.map((p) => programPath(p.slug)))
  const mobileNavItems = mainNav.filter((item) => {
    if (!LABS_STOREFRONT_VISIBLE && isLabsNavPath(item.path)) return false
    if (item.path.startsWith('/programs/')) return visibleProgramPaths.has(item.path)
    return true
  })

  const headerAuthLinks = isAuthenticated
    ? [
        { path: '/profile/study', label: 'Study Center' },
        { path: '/profile', label: 'Profile' },
      ]
    : authNav

  const desktopItems = [
    { type: 'link', path: '/', label: 'Home' },
    { type: 'programs', label: 'Programs' },
    { type: 'link', path: '/courses', label: 'Courses' },
    ...(LABS_STOREFRONT_VISIBLE ? [{ type: 'link', path: '/labs', label: 'Labs' }] : []),
    { type: 'link', path: '/exploration', label: 'AI Exploration' },
    { type: 'sep' },
    { type: 'link', path: '/showcase', label: 'Achievements' },
    { type: 'link', path: '/cert', label: 'Certification' },
    { type: 'link', path: '/community', label: 'Community' },
    { type: 'sep' },
    { type: 'link', path: '/mall', label: 'AI Mall' },
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
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {showGuestNav ? (
                <>
                  <Link
                    to={authLink('/login', loc.pathname)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-500 text-slate-900 hover:bg-cyan-400 transition-colors whitespace-nowrap"
                  >
                    Log in
                  </Link>
                  <Link
                    to={authLink('/register', loc.pathname)}
                    className="px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors text-slate-300 hover:text-white hover:bg-white/10 border border-white/20"
                  >
                    Register
                  </Link>
                </>
              ) : authLoading ? (
                <span className="text-xs text-slate-500 px-2">…</span>
              ) : (
                <>
                  {headerAuthLinks.map(({ path, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${navLinkClass(isNavActive(loc, path))}`}
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/10 whitespace-nowrap"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
          <nav className="lg:hidden nav-scroll-mobile pb-2" aria-label="Mobile navigation">
            {mobileNavItems
              .filter(({ path }) => path !== '/profile')
              .map(({ path, label }) => (
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
            {showGuestNav ? (
              <>
                <Link
                  to={authLink('/login', loc.pathname)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 min-h-[44px] inline-flex items-center font-semibold bg-cyan-500 text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to={authLink('/register', loc.pathname)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 min-h-[44px] inline-flex items-center bg-white/10 text-slate-200"
                >
                  Register
                </Link>
              </>
            ) : authLoading ? null : (
              <>
                {headerAuthLinks.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 min-h-[44px] inline-flex items-center ${
                      isNavActive(loc, path) ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </>
            )}
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
              {LABS_STOREFRONT_VISIBLE ? (
                <Link to="/labs" className="block hover:text-white">Labs & kits</Link>
              ) : null}
              <Link to="/exploration" className="block hover:text-white">AI Exploration (free games)</Link>
              {visiblePrograms.length > 1 ? (
                <Link to="/compare" className="block hover:text-white">Compare Programs</Link>
              ) : null}
              <Link to="/showcase" className="block hover:text-white">Achievements</Link>
              <Link to="/cert" className="block hover:text-white">Certification</Link>
              <Link to="/mall" className="block hover:text-white">AI Mall</Link>
            </div>
            <div>
              <div className="text-white font-medium mb-2">Programs</div>
              {visiblePrograms.map((p) => (
                <Link key={p.slug} to={programPath(p.slug)} className="block hover:text-white">
                  {p.title}
                </Link>
              ))}
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
