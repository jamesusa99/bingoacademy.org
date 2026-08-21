import React, { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Menu } from 'lucide-react'
import { HOME_PRIMARY_CTAS } from '../config/homeCtas'
import {
  GUEST_DESKTOP_NAV,
  guestNavTo,
  isGuestNavActive,
} from '../config/guestNav'
import { GUEST_FOOTER_NAV, guestFooterTo } from '../config/guestFooter'
import {
  STUDENT_NAV,
  STUDENT_FOOTER_NAV,
  studentNavTo,
  isStudentNavActive,
} from '../config/studentNav'
import { useAuth } from '../contexts/AuthContext'
import { ProductLineVisibilityProvider } from '../contexts/ProductLineVisibilityContext'
import { authLink } from '../lib/authRedirect'
import LazyChatWidget from './LazyChatWidget'
import FooterCompliance from './layout/FooterCompliance'
import MobileNavMenu from './layout/MobileNavMenu'
import MobileFixedAssessmentCta from './layout/MobileFixedAssessmentCta'
import { SITE_BRAND } from '../config/siteSeo'

function navLinkClass(active) {
  if (active) return 'bg-cyan-500 text-white'
  return 'text-slate-300 hover:text-white hover:bg-white/10'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [loc.pathname, loc.hash])

  const showGuestNav = !authLoading && !isAuthenticated
  const showStudentNav = !authLoading && isAuthenticated
  const { assessment } = HOME_PRIMARY_CTAS

  const logoTo = '/'

  const assessmentButtonClass =
    'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-cyan-500 text-slate-900 hover:bg-cyan-400 transition-colors whitespace-nowrap'

  const mobileHeaderAssessmentClass =
    'inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-900 hover:bg-cyan-400 transition-colors whitespace-nowrap min-h-[36px]'

  const desktopNavItems = showStudentNav ? STUDENT_NAV : GUEST_DESKTOP_NAV
  const mobileMenuItems = desktopNavItems

  const renderDesktopNavLink = (item) => {
    const active = showStudentNav ? isStudentNavActive(loc, item) : isGuestNavActive(loc, item)
    const to = showStudentNav ? studentNavTo(item) : guestNavTo(item)

    return (
      <Link key={item.label} to={to} className={`px-2.5 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${navLinkClass(active)}`}>
        {item.label}
      </Link>
    )
  }

  const mainPaddingClass = showGuestNav
    ? 'pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
    : 'pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:pb-0'

  return (
    <div className={`min-h-screen flex flex-col ${showGuestNav ? 'has-mobile-assessment-cta' : ''}`}>
      <header className="sticky top-0 z-50 bg-bingo-dark text-white shadow-lg border-b border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b] pt-[env(safe-area-inset-top)]">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:gap-4 min-h-14">
            <Link to={logoTo} className="shrink-0 flex items-center mr-auto lg:mr-0" aria-label={`${SITE_BRAND} home`}>
              <img
                src="/logo.png"
                alt={SITE_BRAND}
                className="h-9 sm:h-10 w-auto max-w-[132px] sm:max-w-none"
                width={895}
                height={209}
              />
            </Link>

            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0" aria-label="Main">
              {desktopNavItems.map((item) => renderDesktopNavLink(item))}
            </nav>

            <div className="hidden lg:flex items-center gap-2 shrink-0 ml-auto">
              {showGuestNav ? (
                <>
                  <Link
                    to={authLink('/login', loc.pathname)}
                    className="px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    Log In
                  </Link>
                  <Link to={assessment.to} className={assessmentButtonClass}>
                    {assessment.navLabel}
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  </Link>
                </>
              ) : authLoading ? (
                <span className="text-xs text-slate-500 px-2">…</span>
              ) : (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 whitespace-nowrap"
                >
                  Sign Out
                </button>
              )}
            </div>

            <div className="flex lg:hidden items-center gap-1.5 shrink-0">
              {showGuestNav ? (
                <>
                  <Link
                    to={authLink('/login', loc.pathname)}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 whitespace-nowrap min-h-[36px] inline-flex items-center"
                  >
                    Log In
                  </Link>
                  <Link to={assessment.to} className={mobileHeaderAssessmentClass}>
                    {assessment.mobileHeaderLabel}
                  </Link>
                </>
              ) : authLoading ? (
                <span className="text-xs text-slate-500 px-1">…</span>
              ) : null}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-5 h-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNavMenu
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        items={mobileMenuItems}
        variant={showStudentNav ? 'student' : 'guest'}
        onSignOut={showStudentNav ? signOut : undefined}
      />

      <main className={`flex-1 ${mainPaddingClass}`}>{children}</main>

      {showGuestNav ? <MobileFixedAssessmentCta /> : null}

      <footer className="bg-bingo-dark text-slate-400 text-sm py-8 border-t border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between lg:gap-6">
          <div className="col-span-2 sm:col-span-3 lg:col-auto">
            <Link to={logoTo} className="inline-block">
              <img
                src="/logo.png"
                alt={SITE_BRAND}
                className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                width={895}
                height={209}
              />
            </Link>
            <p className="mt-2 text-slate-500">
              {showStudentNav ? 'Student workspace' : 'IOAI-oriented training · Ages 12–18'}
            </p>
          </div>
          {showStudentNav ? (
            <div className="col-span-2 sm:col-span-1">
              <div className="text-white font-medium mb-2">Learning</div>
              {STUDENT_FOOTER_NAV.map((item) => (
                <Link key={item.label} to={studentNavTo(item)} className="block hover:text-white py-0.5">
                  {item.label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="text-white font-medium mb-2">Explore</div>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                {GUEST_FOOTER_NAV.map((item) =>
                  item.external ? (
                    <a
                      key={item.label}
                      href={guestFooterTo(item)}
                      className="block hover:text-white py-0.5"
                      {...(String(item.href || '').startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.label} to={guestFooterTo(item)} className="block hover:text-white py-0.5">
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          )}
        </div>
        <FooterCompliance />
      </footer>
      <LazyChatWidget />
    </div>
  )
}
