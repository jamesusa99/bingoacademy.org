import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import LandingShell from '../../components/landing/LandingShell'
import TryAiCuriosityModal from '../../components/landing/TryAiCuriosityModal'
import AICyberTennis from '../../components/lab/AICyberTennis'
import { TRY_AI_LANDING } from '../../config/landingPages'
import { claimFreeTrial, hasClaimedFreeTrial } from '../../lib/freeTrial'
import { useFreeTrialLesson } from '../../hooks/useFreeTrialLesson'

const STORAGE_KEY = 'bingo-try-ai-curiosity-seen'

export default function TryAiLanding() {
  const navigate = useNavigate()
  const { catalogSlug, href: trialHref } = useFreeTrialLesson()
  const [modalOpen, setModalOpen] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const timerRef = useRef(null)
  const triggeredRef = useRef(false)

  const openCuriosityModal = useCallback(() => {
    if (triggeredRef.current) return
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    } catch {
      /* ignore */
    }
    triggeredRef.current = true
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setModalOpen(true)
  }, [])

  const handleGameStart = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = window.setTimeout(openCuriosityModal, TRY_AI_LANDING.curiosityDelayMs)
  }, [openCuriosityModal])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleClaimTrial = () => {
    if (!catalogSlug) return
    setClaiming(true)
    if (!hasClaimedFreeTrial()) {
      claimFreeTrial(catalogSlug)
    }
    navigate(trialHref)
  }

  const closeModal = () => setModalOpen(false)

  return (
    <LandingShell variant="dark" className="min-h-[100dvh]">
      <PageMeta title={TRY_AI_LANDING.seo.title} description={TRY_AI_LANDING.seo.description} />

      <div className="shrink-0 px-4 sm:px-6 py-4 text-center border-b border-white/5 bg-slate-950/50">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90 mb-1">
          {TRY_AI_LANDING.eyebrow}
        </p>
        <h1 className="text-xl sm:text-2xl font-black text-white">{TRY_AI_LANDING.headline}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">{TRY_AI_LANDING.subhead}</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <AICyberTennis landingMode autoStart onGameStart={handleGameStart} />
      </div>

      <TryAiCuriosityModal
        open={modalOpen}
        onClose={closeModal}
        onClaimTrial={handleClaimTrial}
        claiming={claiming}
      />
    </LandingShell>
  )
}
