import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { mainNavGroups, authNav, mainNav } from '../config/nav'
import ChatWidget from './ChatWidget'

export default function Layout({ children }) {
  const loc = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-bingo-dark text-white shadow-lg border-b border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b] pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
          {/* Desktop: single row, center nav scrolls, right auth always visible */}
          <div className="hidden lg:flex items-center gap-1 min-h-14">
            <Link to="/" className="shrink-0 flex items-center gap-1.5 pr-2">
              <img src="/logo.png" alt="Bingo AI Academy" className="h-8 w-auto" />
              <span className="font-bold text-white text-sm tracking-tight whitespace-nowrap">BingoAcademy</span>
            </Link>
            <nav className="flex-1 min-w-0 flex items-center justify-start gap-0.5 overflow-x-auto overflow-y-hidden py-2">
              {mainNavGroups.map((group, gi) => (
                <React.Fragment key={gi}>
                  {gi > 0 && <span className="w-px h-4 bg-cyan-500/50 shrink-0 mx-0.5" aria-hidden />}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {group.map(({ path, label }) => (
                      <Link
                        key={path}
                        to={path}
                        className={`px-2 py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap transition-colors ${
                          loc.pathname === path ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </nav>
            <div className="shrink-0 flex items-center gap-0.5 pl-2 border-l border-cyan-500/30 ml-1">
              {authNav.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-2 py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    loc.pathname === path || (path === '/profile' && loc.pathname.startsWith('/profile'))
                      ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {/* Mobile: two rows, all links visible */}
          <div className="lg:hidden py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="shrink-0 flex items-center gap-1.5">
                <img src="/logo.png" alt="Bingo AI Academy" className="h-7 w-auto" />
                <span className="font-bold text-white text-sm">BingoAcademy</span>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                {authNav.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                      loc.pathname === path || (path === '/profile' && loc.pathname.startsWith('/profile'))
                        ? 'bg-cyan-500 text-white' : 'bg-white/10'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mainNav.filter(n => n.path !== '/').map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                    loc.pathname === path ? 'bg-cyan-500 text-white' : 'bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-24 lg:pt-20">{children}</main>
      <footer className="bg-bingo-dark text-slate-400 text-sm py-8 border-t border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap justify-between gap-6">
          <div>
            <span className="text-cyan-400 font-semibold">Bingo AI Academy</span>
            <p className="mt-1">AI Courses & Authoritative Competitions · From Basics to Career</p>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-white font-medium mb-2">For Users</div>
              <Link to="/courses" className="block hover:text-white">AI Courses</Link>
              <Link to="/events" className="block hover:text-white">Events Center</Link>
              <Link to="/research" className="block hover:text-white">AI Camp</Link>
              <Link to="/career" className="block hover:text-white">Industry-Education</Link>
              <Link to="/mall" className="block hover:text-white">AI Mall</Link>
              <Link to="/profile" className="block hover:text-white">Profile</Link>
            </div>
            <div>
              <div className="text-white font-medium mb-2">B2B Partners</div>
              <a href="/#/b" className="block hover:text-white">Schools & Institutions</a>
              <a href="/#/b" className="block hover:text-white">Franchise Partners</a>
              <a href="/#/b" className="block hover:text-white">Event Partners</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-6 pt-6 border-t border-gray-700 text-center">
          Expert Team · Licensed Competitions · Authentic Products
        </div>
      </footer>
      <ChatWidget />
    </div>
  )
}
