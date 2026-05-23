import { useState } from 'react'
import { Link } from 'react-router-dom'
import ScienceDashboard from './ScienceDashboard'
import WordGravityDemo from './WordGravityDemo'
import { BADGE_STORAGE_KEY } from '../../config/explorationLab'

const CATEGORY_ACCENT = { cv: 'cyan', nlp: 'violet', ml: 'amber' }

function unlockBadge(badge) {
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!list.includes(badge.id)) {
      localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify([...list, badge.id]))
    }
    return true
  } catch {
    return false
  }
}

export default function ExperimentCard({ experiment, onBadgeUnlock }) {
  const [expanded, setExpanded] = useState(false)
  const [badgeFlash, setBadgeFlash] = useState(false)
  const accent = CATEGORY_ACCENT[experiment.category] ?? 'cyan'

  const handleComplete = () => {
    if (unlockBadge(experiment.badge)) {
      setBadgeFlash(true)
      onBadgeUnlock?.(experiment.badge)
      setTimeout(() => setBadgeFlash(false), 2400)
    }
  }

  const statusLabel =
    experiment.status === 'live'
      ? { text: 'Play now', class: 'bg-cyan-100 text-cyan-900' }
      : experiment.status === 'preview'
        ? { text: 'Try preview', class: 'bg-violet-100 text-violet-800' }
        : { text: 'Coming soon', class: 'bg-slate-100 text-slate-600' }

  return (
    <article
      className={`card flex flex-col h-full border-2 transition-all ${
        expanded ? 'border-primary/40 shadow-lg ring-2 ring-primary/10' : ''
      }`}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-3xl" aria-hidden>
            {experiment.emoji}
          </span>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusLabel.class}`}>
              {statusLabel.text}
            </span>
            <span className="text-[10px] text-slate-400">
              {experiment.difficulty} · {experiment.duration}
            </span>
          </div>
        </div>
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-0.5">
          Experiment {experiment.number}
        </p>
        <h3 className="font-bold text-bingo-dark text-lg leading-snug">{experiment.title}</h3>
        <p className="text-xs text-slate-500 mb-3">{experiment.subtitle}</p>
        <p className="text-sm text-slate-600 leading-relaxed flex-1">{experiment.gameplay}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {experiment.concepts.map((c) => (
            <span key={c} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {c}
            </span>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 mt-3 font-mono">{experiment.tech}</p>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span title="Badge reward">
            {experiment.badge.icon} {experiment.badge.name}
          </span>
          {badgeFlash && (
            <span className="text-emerald-600 font-semibold animate-pulse">Unlocked!</span>
          )}
        </div>

        {experiment.playPath ? (
          <Link
            to={experiment.playPath}
            className="mt-4 w-full min-h-[44px] rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center hover:opacity-95 transition shadow"
          >
            Play now →
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={`w-full min-h-[44px] rounded-xl border border-slate-200 text-sm font-semibold text-bingo-dark hover:bg-slate-50 transition ${
            experiment.playPath ? 'mt-2' : 'mt-4'
          }`}
        >
          {expanded ? 'Collapse' : experiment.status === 'preview' ? 'Open preview' : 'View details'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
          <ScienceDashboard metrics={experiment.dashboardMetrics} active accent={accent} />
          {experiment.id === 'word-gravity' && !experiment.playPath ? (
            <WordGravityDemo onComplete={handleComplete} />
          ) : experiment.playPath ? (
            <p className="text-xs text-center text-violet-600">
              Open the full-screen physics arena with the Play now button above.
            </p>
          ) : (
            <div className="rounded-xl bg-white border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              <p className="font-medium text-bingo-dark mb-1">Web build in progress</p>
              <p className="text-xs">
                {experiment.techTags?.join(' · ')} — zero-install launch for PC, Mac & iPad.
              </p>
            </div>
          )}
          {experiment.id === 'word-gravity' && (
            <p className="text-xs text-center text-slate-500">
              Score 85%+ semantic pull to unlock the {experiment.badge.name} badge.
            </p>
          )}
        </div>
      )}
    </article>
  )
}
