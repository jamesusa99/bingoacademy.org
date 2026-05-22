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
            <Link to="/" className="shrink-0 flex items-center" aria-label="BingoAcademy 首页">
              <img
                src="/logo.png"
                alt="BingoAcademy"
                className="h-9 sm:h-10 w-auto"
                width={895}
                height={209}
              />
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
          {/* Mobile nav — horizontal scroll, 44px touch targets */}
          <nav className="lg:hidden nav-scroll-mobile" aria-label="Mobile navigation">
            {mainNavGroups.map((group, gi) => (
              <React.Fragment key={gi}>
                {gi > 0 && <span className="w-0.5 h-5 bg-cyan-400/60 shrink-0 rounded-full self-center" aria-hidden />}
                {group.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 ${
                      loc.pathname === path || (path === '/profile' && loc.pathname.startsWith('/profile')) ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </React.Fragment>
            ))}
            {authNav.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 text-xs sm:text-sm rounded-lg whitespace-nowrap ${
                  loc.pathname === path ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-200'
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
              <Link to="/" className="block hover:text-white">AI Era Portal</Link>
              <Link to="/courses" className="block hover:text-white">AI Courses</Link>
              <Link to="/lab" className="block hover:text-white">AI Exploration Lab</Link>
              <Link to="/showcase" className="block hover:text-white">Achievements</Link>
              <Link to="/cert" className="block hover:text-white">Certification</Link>
              <Link to="/mall" className="block hover:text-white">AI Mall</Link>
              <Link to="/profile" className="block hover:text-white">Profile</Link>
            </div>
            <div>
              <div className="text-white font-medium mb-2">Products</div>
              <Link to="/courses?line=general" className="block hover:text-white">Foundations of AI Program</Link>
              <Link to="/courses?line=ioai" className="block hover:text-white">IOAI Competition Training</Link>
              <Link to="/courses?line=k12" className="block hover:text-white">K12 Classroom Edition</Link>
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
