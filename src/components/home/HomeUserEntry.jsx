import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, GraduationCap, Gift, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { HOME_USER_ENTRY } from '../../config/homeUserEntry'
import { authLink } from '../../lib/authRedirect'
import { claimFreeTrial, hasClaimedFreeTrial } from '../../lib/freeTrial'
import { useFreeTrialLesson } from '../../hooks/useFreeTrialLesson'

const STUDY_PATH = HOME_USER_ENTRY.studyRedirect

export default function HomeUserEntry() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, user } = useAuth()
  const { catalogSlug, title: trialTitle, href: trialHref } = useFreeTrialLesson()
  const [trialClaimed, setTrialClaimed] = useState(hasClaimedFreeTrial())
  const [claiming, setClaiming] = useState(false)
  const [toast, setToast] = useState('')

  const showGuest = !loading && !isAuthenticated

  const handleFreeTrial = () => {
    if (!catalogSlug) return
    setClaiming(true)
    if (!trialClaimed) {
      claimFreeTrial(catalogSlug)
      setTrialClaimed(true)
      setToast(HOME_USER_ENTRY.trialSuccess)
    }
    setClaiming(false)
    navigate(trialHref)
  }

  const handleStudyCenter = () => {
    if (isAuthenticated) {
      navigate(STUDY_PATH)
      return
    }
    navigate(authLink('/login', STUDY_PATH))
  }

  const freeTrialLabel = trialClaimed
    ? HOME_USER_ENTRY.freeTrial.claimedLabel
    : HOME_USER_ENTRY.freeTrial.label

  const freeTrialDesc = trialClaimed
    ? trialTitle
      ? `${HOME_USER_ENTRY.freeTrial.claimedDesc} · ${trialTitle}`
      : HOME_USER_ENTRY.freeTrial.claimedDesc
    : trialTitle
      ? `${HOME_USER_ENTRY.freeTrial.desc} · ${trialTitle}`
      : HOME_USER_ENTRY.freeTrial.desc

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6 shadow-xl">
        <div className="text-center mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">
            {HOME_USER_ENTRY.eyebrow}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-white">{HOME_USER_ENTRY.title}</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            {showGuest ? HOME_USER_ENTRY.guestSubtitle : HOME_USER_ENTRY.subtitle}
          </p>
        </div>

        {toast ? (
          <p className="text-center text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 mb-4">
            {toast}
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <EntryButton
              as={Link}
              to={authLink('/login', STUDY_PATH)}
              icon={LogIn}
              label={HOME_USER_ENTRY.login.label}
              desc={HOME_USER_ENTRY.login.desc}
              variant="primary"
            />
            <EntryButton
              as={Link}
              to={authLink('/register', STUDY_PATH)}
              icon={UserPlus}
              label={HOME_USER_ENTRY.register.label}
              desc={HOME_USER_ENTRY.register.desc}
              variant="secondary"
            />
          </div>
        ) : showGuest ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <EntryButton
              as={Link}
              to={authLink('/login', STUDY_PATH)}
              icon={LogIn}
              label={HOME_USER_ENTRY.login.label}
              desc={HOME_USER_ENTRY.login.desc}
              variant="primary"
            />
            <EntryButton
              as={Link}
              to={authLink('/register', STUDY_PATH)}
              icon={UserPlus}
              label={HOME_USER_ENTRY.register.label}
              desc={HOME_USER_ENTRY.register.desc}
              variant="secondary"
            />
            <EntryButton
              as="button"
              type="button"
              onClick={handleFreeTrial}
              disabled={claiming}
              icon={Gift}
              label={freeTrialLabel}
              desc={freeTrialDesc}
              variant="accent"
              highlight={!trialClaimed}
            />
            <EntryButton
              as="button"
              type="button"
              onClick={handleStudyCenter}
              icon={GraduationCap}
              label={HOME_USER_ENTRY.studyCenter.label}
              desc={HOME_USER_ENTRY.studyCenter.loginRequired}
              variant="secondary"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <EntryButton
              as={Link}
              to={STUDY_PATH}
              icon={GraduationCap}
              label={HOME_USER_ENTRY.studyCenter.label}
              desc={HOME_USER_ENTRY.studyCenter.desc}
              variant="primary"
            />
            <EntryButton
              as={Link}
              to="/profile"
              icon={User}
              label={HOME_USER_ENTRY.profile.label}
              desc={HOME_USER_ENTRY.profile.desc}
              variant="secondary"
            />
            <EntryButton
              as="button"
              type="button"
              onClick={handleFreeTrial}
              disabled={claiming}
              icon={Gift}
              label={freeTrialLabel}
              desc={freeTrialDesc}
              variant="accent"
              highlight={!trialClaimed}
            />
          </div>
        )}

        {showGuest ? (
          <p className="text-center text-[11px] text-slate-400 mt-4">
            {HOME_USER_ENTRY.guestHint}
          </p>
        ) : isAuthenticated ? (
          <p className="text-center text-[11px] text-emerald-300/90 mt-4">
            {user?.email ? `Signed in as ${user.email} — ` : 'Signed in — '}
            <Link to={STUDY_PATH} className="underline hover:text-emerald-200">
              Open Study Center
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  )
}

function EntryButton({
  as: Component = 'button',
  icon: Icon,
  label,
  desc,
  variant,
  highlight,
  ...props
}) {
  const styles = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 border-cyan-400/50',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border-white/15',
    accent: highlight
      ? 'bg-amber-500/90 hover:bg-amber-400 text-slate-900 border-amber-400/50 ring-1 ring-amber-300/40'
      : 'bg-white/5 hover:bg-white/10 text-white border-white/15',
  }

  return (
    <Component
      className={`flex flex-col items-center text-center gap-2 p-4 rounded-xl border transition min-h-[100px] disabled:opacity-60 ${styles[variant]}`}
      {...props}
    >
      <Icon className="w-5 h-5 shrink-0" aria-hidden />
      <span className="text-sm font-bold leading-tight">{label}</span>
      <span className="text-[10px] opacity-80 leading-snug">{desc}</span>
    </Component>
  )
}
