import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, X } from 'lucide-react'
import { LAB_EXPERIMENTS_PORTAL, LAB_STEP_TYPES } from '../../config/labExperiments'

function stepTypeLabel(type) {
  return LAB_STEP_TYPES.find((t) => t.id === type)?.label || type
}

function InstructionStep({ step, index, active, selectable, onSelect }) {
  const label = step.title || stepTypeLabel(step.stepType)
  const text = step.body || step.downloadLabel || ''

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(index)}
        disabled={!selectable}
        className={`lab-instructions__step w-full text-left transition ${
          active ? 'lab-instructions__step--active' : ''
        } ${selectable ? 'cursor-pointer hover:border-emerald-500/40' : 'cursor-default'}`}
      >
        <span className="lab-instructions__step-num">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-200">{label}</p>
            {active ? (
              <span className="text-[10px] font-semibold text-emerald-400 shrink-0">
                {LAB_EXPERIMENTS_PORTAL.stepActiveInWorkspace}
              </span>
            ) : selectable ? (
              <span className="text-[10px] text-slate-500 shrink-0">
                {LAB_EXPERIMENTS_PORTAL.showStepInWorkspace}
              </span>
            ) : null}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{stepTypeLabel(step.stepType)}</p>
          {text ? (
            <p className="text-xs text-slate-400 mt-1.5 whitespace-pre-wrap leading-relaxed">{text}</p>
          ) : null}
        </div>
      </button>
    </li>
  )
}

export function LabInstructionsToggle({ open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`lab-instructions__toggle ${open ? 'lab-instructions__toggle--open' : ''}`}
      aria-expanded={open}
      aria-controls="lab-instructions-panel"
    >
      <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
      <span>{LAB_EXPERIMENTS_PORTAL.instructionsTitle}</span>
      <ChevronDown className={`w-4 h-4 shrink-0 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
    </button>
  )
}

export default function LabInstructionsDrawer({
  experiment,
  canAccessSteps,
  open,
  onClose,
  activeStepIndex = 0,
  onStepSelect,
  showStepPicker = false,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const steps = canAccessSteps ? experiment?.steps || [] : []
  const hasPurpose = Boolean(experiment?.purpose?.trim())
  const hasContent = Boolean(experiment?.content?.trim())
  const hasSteps = steps.length > 0

  return (
    <div
      id="lab-instructions-panel"
      className="lab-instructions__panel"
      role="dialog"
      aria-label={LAB_EXPERIMENTS_PORTAL.instructionsTitle}
    >
      <div className="lab-instructions__panel-head">
        <div>
          <h2 className="text-sm font-semibold text-white">{LAB_EXPERIMENTS_PORTAL.instructionsTitle}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">{LAB_EXPERIMENTS_PORTAL.instructionsDrawerHint}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          aria-label={LAB_EXPERIMENTS_PORTAL.closeInstructions}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="lab-instructions__panel-body">
        {hasContent ? (
          <section className="mb-5">
            <h3 className="lab-instructions__section-title">{LAB_EXPERIMENTS_PORTAL.experimentContent}</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{experiment.content}</p>
          </section>
        ) : null}

        {hasPurpose ? (
          <section className="mb-5">
            <h3 className="lab-instructions__section-title">{LAB_EXPERIMENTS_PORTAL.experimentPurpose}</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{experiment.purpose}</p>
          </section>
        ) : null}

        {hasSteps ? (
          <section>
            <h3 className="lab-instructions__section-title mb-3">{LAB_EXPERIMENTS_PORTAL.stepsTitle}</h3>
            <ol className="space-y-2.5">
              {steps.map((step, index) => (
                <InstructionStep
                  key={step.id}
                  step={step}
                  index={index}
                  active={showStepPicker && index === activeStepIndex}
                  selectable={showStepPicker && Boolean(onStepSelect)}
                  onSelect={onStepSelect}
                />
              ))}
            </ol>
          </section>
        ) : null}

        {!canAccessSteps ? (
          <p className="text-xs text-amber-300/90 mt-4">{LAB_EXPERIMENTS_PORTAL.purchaseToUnlockSteps}</p>
        ) : null}

        {!hasPurpose && !hasContent && !hasSteps ? (
          <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.noInstructions}</p>
        ) : null}
      </div>
    </div>
  )
}

/** Toggle + drawer with shared open state */
export function LabInstructionsPanel(props) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)

  return (
    <>
      <LabInstructionsToggle open={open} onToggle={toggle} />
      <LabInstructionsDrawer {...props} open={open} onClose={close} />
    </>
  )
}
