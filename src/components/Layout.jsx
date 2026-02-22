import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { mainNavGroups, authNav, mainNav } from '../config/nav'
import ChatWidget from './ChatWidget'

export default function Layout({ children }) {
  const loc = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-bingo-dark text-white shadow-lg border-b border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b] pt-[env(safe-area-inset-top)]">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:gap-4 min-h-14">
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <img src="/logo.png" alt="Bingo AI Academy" className="h-8 sm:h-9 w-auto" />
              <span className="font-bold text-white text-sm sm:text-base tracking-tight">BingoAcademy</span>
            </Link>
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0">
              {mainNavGroups.map((group, gi) => (
                <React.Fragment key={gi}>
                  {gi > 0 && <span className="w-0.5 h-5 bg-cyan-400/80 shrink-0 rounded-full" aria-hidden />}
                  <div className="flex items-center gap-1 shrink-0">
                    {group.map(({ path, label }) => (
                      <Link
                        key={path}
                        to={path}
                        className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                          loc.pathname === path || (path === '/profile' && loc.pathname.startsWith('/profile')) ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {authNav.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    loc.pathname === path ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {/* Mobile nav */}
          <div className="lg:hidden pb-3 flex flex-wrap gap-2 items-center">
            {mainNav.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-2 py-1.5 text-xs rounded shrink-0 ${
                  loc.pathname === path || (path === '/profile' && loc.pathname.startsWith('/profile')) ? 'bg-cyan-500 text-white' : 'bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}
            {authNav.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-2 py-1.5 text-xs rounded shrink-0 ${
                  loc.pathname === path ? 'bg-cyan-500 text-white' : 'bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}
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
