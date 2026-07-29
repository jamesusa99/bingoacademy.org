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
  const isNew = Boolean(experiment.isNew)

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
      className={`card flex flex-col h-full border-2 transition-all relative overflow-hidden ${
        isNew
          ? 'border-cyan-400/80 shadow-[0_0_28px_rgba(34,211,238,0.35)] ring-2 ring-fuchsia-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950/40'
          : expanded
            ? 'border-primary/40 shadow-lg ring-2 ring-primary/10'
            : ''
      }`}
    >
      {isNew ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(217,70,239,0.45) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
            aria-hidden
          />
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-fuchsia-500 text-white shadow-[0_0_16px_rgba(217,70,239,0.7)] animate-pulse">
              NEW
            </span>
          </div>
        </>
      ) : null}

      <div className={`p-5 flex flex-col flex-1 relative z-[1] ${isNew ? 'pt-12' : ''}`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-3xl" aria-hidden>
            {experiment.emoji}
          </span>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                isNew ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : statusLabel.class
              }`}
            >
              {statusLabel.text}
            </span>
            <span className={`text-[10px] ${isNew ? 'text-slate-400' : 'text-slate-400'}`}>
              {experiment.difficulty} · {experiment.duration}
            </span>
          </div>
        </div>
        <p
          className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${
            isNew ? 'text-cyan-400' : 'text-primary'
          }`}
        >
          Experiment {experiment.number}
        </p>
        <h3 className={`font-bold text-lg leading-snug ${isNew ? 'text-white' : 'text-bingo-dark'}`}>
          {experiment.title}
        </h3>
        <p className={`text-xs mb-3 ${isNew ? 'text-fuchsia-200/80' : 'text-slate-500'}`}>
          {experiment.subtitle}
        </p>
        <p className={`text-sm leading-relaxed flex-1 ${isNew ? 'text-slate-300' : 'text-slate-600'}`}>
          {experiment.gameplay}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {experiment.concepts.map((c) => (
            <span
              key={c}
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                isNew
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/30'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {c}
            </span>
          ))}
        </div>

        <p className={`text-[10px] mt-3 font-mono ${isNew ? 'text-slate-500' : 'text-slate-400'}`}>
          {experiment.tech}
        </p>

        <div className={`mt-4 flex items-center gap-2 text-xs ${isNew ? 'text-slate-400' : 'text-slate-500'}`}>
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
            className={`mt-4 w-full min-h-[44px] rounded-xl text-sm font-semibold flex items-center justify-center transition shadow ${
              isNew
                ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-95 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                : 'bg-primary text-white hover:opacity-95'
            }`}
          >
            Play now →
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={`w-full min-h-[44px] rounded-xl border text-sm font-semibold transition ${
            experiment.playPath ? 'mt-2' : 'mt-4'
          } ${
            isNew
              ? 'border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/10'
              : 'border-slate-200 text-bingo-dark hover:bg-slate-50'
          }`}
        >
          {expanded ? 'Collapse' : experiment.status === 'preview' ? 'Open preview' : 'View details'}
        </button>
      </div>

      {expanded && (
        <div
          className={`border-t p-5 space-y-4 relative z-[1] ${
            isNew ? 'border-cyan-500/20 bg-slate-950/60' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <ScienceDashboard metrics={experiment.dashboardMetrics} active accent={accent} />
          {experiment.id === 'word-gravity' && !experiment.playPath ? (
            <WordGravityDemo onComplete={handleComplete} />
          ) : experiment.playPath ? (
            <p className={`text-xs text-center ${isNew ? 'text-cyan-300/80' : 'text-violet-600'}`}>
              Open the full-screen arena with the Play now button above.
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
