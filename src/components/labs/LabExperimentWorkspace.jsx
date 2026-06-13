import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronUp, StickyNote } from 'lucide-react'
import LabExperimentNavSidebar from './LabExperimentNavSidebar'
import LabInstructionsDrawer, { LabInstructionsToggle } from './LabInstructionsPanel'
import LabExperimentNotesPanel from './LabExperimentNotesPanel'
import LabExperimentRuntimePanel from './LabExperimentRuntimePanel'
import LabStepViewer from './LabStepViewer'
import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'
import { hasExperimentRuntime, normalizeRuntimeConfig } from '../../config/labExperimentRuntime'
import { useLabExperimentNotes } from '../../hooks/useLabExperimentNotes'

export default function LabExperimentWorkspace({
  packSlug,
  pack,
  experiment,
  experiments,
  owned,
  canAccessSteps = false,
  experimentIndex,
}) {
  const steps = canAccessSteps ? experiment?.steps || [] : []
  const runtimeConfig = normalizeRuntimeConfig(experiment?.runtimeConfig || experiment?.runtime_config)
  const hasRuntime = hasExperimentRuntime(runtimeConfig)
  const [activeStep, setActiveStep] = useState(0)
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [progressTick, setProgressTick] = useState(0)
  const safeStep = steps.length ? Math.min(activeStep, steps.length - 1) : 0
  const currentStep = steps[safeStep]

  useEffect(() => {
    setActiveStep(0)
  }, [experiment.slug])

  const { noteBody, setNoteBody, savedAt, saveStatus, save, complete } = useLabExperimentNotes(
    packSlug,
    experiment.slug
  )

  const handleSave = () => {
    save()
    setProgressTick((t) => t + 1)
  }

  const handleComplete = () => {
    complete()
    setProgressTick((t) => t + 1)
  }

  const packHref = `/labs/pack/${encodeURIComponent(packSlug)}`
  const packName = pack?.nameEn || pack?.name || packSlug
  const showStepInCenter = canAccessSteps && !hasRuntime && steps.length > 0

  return (
    <div className="lab-workspace">
      <LabExperimentNavSidebar
        packSlug={packSlug}
        packName={packName}
        experiments={experiments}
        currentSlug={experiment.slug}
        owned={owned}
        progressTick={progressTick}
      />

      <main className="lab-workspace__main">
        <header className="lab-workspace__header lab-workspace__header--compact">
          <div className="min-w-0 flex-1">
            <Link to={packHref} className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden />
              {LAB_EXPERIMENTS_PORTAL.backToPack}
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug truncate">
              {LAB_EXPERIMENTS_PORTAL.experimentHeading(experimentIndex + 1, experiment.title)}
            </h1>
          </div>
        </header>

        {!canAccessSteps ? (
          <div className="lab-workspace__lock-banner">
            <p className="text-sm text-amber-200/90">{LAB_EXPERIMENTS_PORTAL.purchaseToUnlockSteps}</p>
            <Link to={packHref} className="text-sm font-semibold text-emerald-400 hover:underline mt-2 inline-block">
              {LAB_EXPERIMENTS_PORTAL.buyPack} →
            </Link>
          </div>
        ) : null}

        <div className="lab-workspace__canvas-wrap">
          <div className="lab-workspace__canvas-toolbar">
            <div className="lab-workspace__canvas-tab" title={experiment.title}>
              {experiment.title}
            </div>
            <div className="lab-workspace__canvas-actions">
              <button
                type="button"
                onClick={() => setNotesOpen((v) => !v)}
                className={`lab-workspace__toolbar-btn ${notesOpen ? 'lab-workspace__toolbar-btn--active' : ''}`}
                aria-expanded={notesOpen}
              >
                <StickyNote className="w-4 h-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">{LAB_EXPERIMENTS_PORTAL.notesTitle}</span>
              </button>
              <LabInstructionsToggle
                open={instructionsOpen}
                onToggle={() => setInstructionsOpen((v) => !v)}
              />
            </div>
          </div>

          <div className="lab-workspace__canvas">
            {canAccessSteps && hasRuntime ? (
              <LabExperimentRuntimePanel runtimeConfig={runtimeConfig} owned={canAccessSteps} />
            ) : showStepInCenter ? (
              <div className="lab-workspace__canvas-inner">
                <LabStepViewer step={currentStep} index={safeStep} dark workspace />
              </div>
            ) : canAccessSteps ? (
              <div className="lab-workspace__canvas-empty">
                <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                  {LAB_EXPERIMENTS_PORTAL.workspacePlaceholder}
                </p>
                <p className="text-xs text-slate-400 mt-3">{LAB_EXPERIMENTS_PORTAL.openInstructionsHint}</p>
              </div>
            ) : (
              <div className="lab-workspace__canvas-empty">
                <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.previewIntroOnly}</p>
                {experiment.content ? (
                  <p className="text-sm text-slate-600 mt-4 max-w-xl leading-relaxed whitespace-pre-wrap">
                    {experiment.content}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <LabInstructionsDrawer
            experiment={experiment}
            canAccessSteps={canAccessSteps}
            open={instructionsOpen}
            onClose={() => setInstructionsOpen(false)}
            activeStepIndex={safeStep}
            onStepSelect={showStepInCenter ? setActiveStep : undefined}
            showStepPicker={showStepInCenter}
          />
        </div>

        {notesOpen ? (
          <div className="lab-workspace__notes-drawer">
            <button
              type="button"
              className="lab-workspace__notes-drawer-toggle"
              onClick={() => setNotesOpen(false)}
              aria-label={LAB_EXPERIMENTS_PORTAL.closeNotes}
            >
              <ChevronUp className="w-4 h-4" aria-hidden />
              {LAB_EXPERIMENTS_PORTAL.closeNotes}
            </button>
            <LabExperimentNotesPanel
              experiment={experiment}
              noteBody={noteBody}
              onNoteChange={setNoteBody}
              onSave={handleSave}
              onComplete={handleComplete}
              savedAt={savedAt}
              saveStatus={saveStatus}
              owned={canAccessSteps}
              embedded
            />
          </div>
        ) : null}
      </main>
    </div>
  )
}
