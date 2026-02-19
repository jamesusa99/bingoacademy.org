import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { allNavGroups, mainNav } from '../config/nav'

export default function Layout({ children }) {
  const loc = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-bingo-dark text-white shadow-lg border-b border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 lg:gap-6 min-h-14 flex-nowrap">
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <img src="/logo.png" alt="Bingo AI Academy" className="h-8 sm:h-9 w-auto" />
              <span className="font-bold text-white text-lg sm:text-xl tracking-tight">BingoAcademy</span>
            </Link>
            <nav className="hidden lg:flex flex-1 items-center justify-evenly gap-2 min-w-0 flex-nowrap">
              {allNavGroups.map((group, gi) => (
                <React.Fragment key={gi}>
                  {gi > 0 && (
                    <span className="w-0.5 h-5 bg-cyan-400/80 shrink-0 rounded-full" aria-hidden />
                  )}
                  <div className="flex items-center justify-center gap-1 shrink-0 py-1">
                    {group.map(({ path, label }) => (
                      <Link
                        key={path}
                        to={path}
                        className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors ${
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
          </div>
          {/* Mobile nav */}
          <div className="lg:hidden pb-3 flex flex-wrap gap-1">
            {mainNav.slice(0, 6).map(({ path, label }) => (
              <Link key={path} to={path} className="px-2 py-1 text-xs rounded bg-white/10">{label}</Link>
            ))}
            <Link to="/mall" className="px-2 py-1 text-xs rounded bg-white/10">AI Mall</Link>
            <Link to="/profile" className="px-2 py-1 text-xs rounded bg-primary">Profile</Link>
            <Link to="/login" className="px-2 py-1 text-xs rounded bg-white/10">Login</Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
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
              <Link to="/research" className="block hover:text-white">Science & Research</Link>
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
    </div>
  )
}
