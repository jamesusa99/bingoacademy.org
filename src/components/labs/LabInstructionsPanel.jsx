import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, X } from 'lucide-react'
import { LAB_EXPERIMENTS_PORTAL, LAB_STEP_TYPES } from '../../config/labExperiments'

const SECTIONS = ['content', 'purpose', 'steps']

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
            <p className="text-sm font-medium text-slate-800">{label}</p>
            {active ? (
              <span className="text-[10px] font-semibold text-emerald-600 shrink-0">
                {LAB_EXPERIMENTS_PORTAL.stepActiveInWorkspace}
              </span>
            ) : selectable ? (
              <span className="text-[10px] text-slate-400 shrink-0">
                {LAB_EXPERIMENTS_PORTAL.showStepInWorkspace}
              </span>
            ) : null}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{stepTypeLabel(step.stepType)}</p>
          {text ? (
            <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{text}</p>
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
  const steps = canAccessSteps ? experiment?.steps || [] : []
  const hasPurpose = Boolean(experiment?.purpose?.trim())
  const hasContent = Boolean(experiment?.content?.trim())
  const hasSteps = steps.length > 0

  const defaultSection = hasSteps ? 'steps' : hasContent ? 'content' : hasPurpose ? 'purpose' : 'content'
  const [activeSection, setActiveSection] = useState(defaultSection)

  useEffect(() => {
    if (!open) return undefined
    setActiveSection(defaultSection)
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, defaultSection])

  if (!open) return null

  const sectionLabel = {
    content: LAB_EXPERIMENTS_PORTAL.experimentContent,
    purpose: LAB_EXPERIMENTS_PORTAL.experimentPurpose,
    steps: LAB_EXPERIMENTS_PORTAL.stepsTitle,
  }

  return (
    <aside
      id="lab-instructions-panel"
      className="lab-instructions__panel"
      role="complementary"
      aria-label={LAB_EXPERIMENTS_PORTAL.instructionsTitle}
    >
      <div className="lab-instructions__panel-head">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">{LAB_EXPERIMENTS_PORTAL.instructionsTitle}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">{LAB_EXPERIMENTS_PORTAL.instructionsDrawerHint}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          aria-label={LAB_EXPERIMENTS_PORTAL.closeInstructions}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="lab-instructions__tabs" role="tablist">
        {SECTIONS.map((id) => {
          const disabled =
            (id === 'content' && !hasContent) ||
            (id === 'purpose' && !hasPurpose) ||
            (id === 'steps' && !hasSteps)
          if (disabled) return null
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeSection === id}
              onClick={() => setActiveSection(id)}
              className={`lab-instructions__tab ${activeSection === id ? 'lab-instructions__tab--active' : ''}`}
            >
              {sectionLabel[id]}
              {id === 'steps' && hasSteps ? (
                <span className="lab-instructions__tab-count">{steps.length}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="lab-instructions__panel-body">
        {activeSection === 'content' && hasContent ? (
          <section>
            <h3 className="lab-instructions__section-title">{LAB_EXPERIMENTS_PORTAL.experimentContent}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{experiment.content}</p>
          </section>
        ) : null}

        {activeSection === 'purpose' && hasPurpose ? (
          <section>
            <h3 className="lab-instructions__section-title">{LAB_EXPERIMENTS_PORTAL.experimentPurpose}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{experiment.purpose}</p>
          </section>
        ) : null}

        {activeSection === 'steps' && hasSteps ? (
          <section>
            <h3 className="lab-instructions__section-title mb-3">{LAB_EXPERIMENTS_PORTAL.stepsTitle}</h3>
            <p className="text-xs text-slate-500 mb-3">{LAB_EXPERIMENTS_PORTAL.stepsPanelHint}</p>
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
          <p className="text-xs text-amber-700 mt-4">{LAB_EXPERIMENTS_PORTAL.purchaseToUnlockSteps}</p>
        ) : null}

        {!hasPurpose && !hasContent && !hasSteps ? (
          <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.noInstructions}</p>
        ) : null}
      </div>
    </aside>
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
