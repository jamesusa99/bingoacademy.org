import { useEffect, useRef, useState } from 'react'
import { BookOpen, ChevronDown, X } from 'lucide-react'
import { LAB_EXPERIMENTS_PORTAL, LAB_STEP_TYPES } from '../../config/labExperiments'

function stepTypeLabel(type) {
  return LAB_STEP_TYPES.find((t) => t.id === type)?.label || type
}

function InstructionStep({ step, index }) {
  const label = step.title || stepTypeLabel(step.stepType)
  const text = step.body || step.downloadLabel || ''

  return (
    <li className="lab-instructions__step">
      <span className="lab-instructions__step-num">{index + 1}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {text ? (
          <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">{text}</p>
        ) : null}
        {step.stepType === 'video' && step.videoUrl ? (
          <p className="text-xs text-emerald-400/80 mt-1">{LAB_EXPERIMENTS_PORTAL.watchInWorkspace}</p>
        ) : null}
        {step.stepType === 'programming' ? (
          <p className="text-xs text-emerald-400/80 mt-1">{LAB_EXPERIMENTS_PORTAL.codeInWorkspace}</p>
        ) : null}
      </div>
    </li>
  )
}

export default function LabInstructionsPanel({ experiment, owned }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e) => {
      if (
        panelRef.current?.contains(e.target) ||
        btnRef.current?.contains(e.target)
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const steps = owned ? experiment?.steps || [] : []
  const hasPurpose = Boolean(experiment?.purpose?.trim())
  const hasContent = Boolean(experiment?.content?.trim())
  const hasSteps = steps.length > 0

  return (
    <div className="lab-instructions">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`lab-instructions__toggle ${open ? 'lab-instructions__toggle--open' : ''}`}
        aria-expanded={open}
        aria-controls="lab-instructions-panel"
      >
        <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
        <span>{LAB_EXPERIMENTS_PORTAL.instructionsTitle}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open ? (
        <div
          id="lab-instructions-panel"
          ref={panelRef}
          className="lab-instructions__panel"
          role="dialog"
          aria-label={LAB_EXPERIMENTS_PORTAL.instructionsTitle}
        >
          <div className="lab-instructions__panel-head">
            <h2 className="text-sm font-semibold text-white">{LAB_EXPERIMENTS_PORTAL.instructionsTitle}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              aria-label={LAB_EXPERIMENTS_PORTAL.closeInstructions}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="lab-instructions__panel-body">
            {hasPurpose ? (
              <section className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90 mb-2">
                  {LAB_EXPERIMENTS_PORTAL.experimentPurpose}
                </h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{experiment.purpose}</p>
              </section>
            ) : null}

            {hasContent ? (
              <section className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90 mb-2">
                  {LAB_EXPERIMENTS_PORTAL.experimentContent}
                </h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{experiment.content}</p>
              </section>
            ) : null}

            {hasSteps ? (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90 mb-3">
                  {LAB_EXPERIMENTS_PORTAL.stepsTitle}
                </h3>
                <ol className="space-y-3">
                  {steps.map((step, index) => (
                    <InstructionStep key={step.id} step={step} index={index} />
                  ))}
                </ol>
              </section>
            ) : null}

            {!owned ? (
              <p className="text-xs text-amber-300/90 mt-4">{LAB_EXPERIMENTS_PORTAL.purchaseToUnlockSteps}</p>
            ) : null}

            {!hasPurpose && !hasContent && !hasSteps ? (
              <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.noInstructions}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
