import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LabExperimentNavSidebar from './LabExperimentNavSidebar'
import LabInstructionsPanel from './LabInstructionsPanel'
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
  apiOwned = false,
  experimentIndex,
}) {
  const canAccessSteps = owned || apiOwned
  const steps = canAccessSteps ? experiment?.steps || [] : []
  const runtimeConfig = normalizeRuntimeConfig(experiment?.runtimeConfig || experiment?.runtime_config)
  const hasRuntime = hasExperimentRuntime(runtimeConfig)
  const [activeStep, setActiveStep] = useState(0)
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
        <header className="lab-workspace__header">
          <div className="min-w-0 flex-1">
            <Link to={packHref} className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden />
              {LAB_EXPERIMENTS_PORTAL.backToPack}
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-white mt-2 leading-snug">
              {LAB_EXPERIMENTS_PORTAL.experimentHeading(experimentIndex + 1, experiment.title)}
            </h1>
          </div>
          <LabInstructionsPanel experiment={experiment} owned={canAccessSteps} />
        </header>

        {!canAccessSteps ? (
          <div className="lab-workspace__lock-banner">
            <p className="text-sm text-amber-200/90">{LAB_EXPERIMENTS_PORTAL.purchaseToUnlockSteps}</p>
            <Link to={packHref} className="text-sm font-semibold text-emerald-400 hover:underline mt-2 inline-block">
              {LAB_EXPERIMENTS_PORTAL.buyPack} →
            </Link>
          </div>
        ) : null}

        {canAccessSteps && hasRuntime ? (
          <>
            <p className="px-5 pt-3 text-xs text-slate-500">{LAB_EXPERIMENTS_PORTAL.runtimeWorkspaceHint}</p>
            <LabExperimentRuntimePanel runtimeConfig={runtimeConfig} owned={canAccessSteps} />
          </>
        ) : canAccessSteps && steps.length > 0 ? (
          <>
            <div className="lab-workspace__step-tabs" role="tablist">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={index === safeStep}
                  onClick={() => setActiveStep(index)}
                  className={`lab-workspace__step-tab ${index === safeStep ? 'lab-workspace__step-tab--active' : ''}`}
                >
                  {LAB_EXPERIMENTS_PORTAL.stepTab(index + 1, step.title)}
                </button>
              ))}
            </div>

            <div className="lab-workspace__stage">
              <LabStepViewer step={currentStep} index={safeStep} dark workspace />
              <div className="lab-workspace__step-nav">
                <button
                  type="button"
                  disabled={safeStep <= 0}
                  onClick={() => setActiveStep((i) => Math.max(0, i - 1))}
                  className="lab-workspace__step-nav-btn"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden />
                  {LAB_EXPERIMENTS_PORTAL.prevStep}
                </button>
                <span className="text-xs text-slate-500">
                  {safeStep + 1} / {steps.length}
                </span>
                <button
                  type="button"
                  disabled={safeStep >= steps.length - 1}
                  onClick={() => setActiveStep((i) => Math.min(steps.length - 1, i + 1))}
                  className="lab-workspace__step-nav-btn"
                >
                  {LAB_EXPERIMENTS_PORTAL.nextStep}
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>
          </>
        ) : canAccessSteps ? (
          <div className="lab-workspace__stage lab-workspace__stage--empty">
            <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.noSteps}</p>
            <p className="text-xs text-slate-600 mt-2">{LAB_EXPERIMENTS_PORTAL.openInstructionsHint}</p>
          </div>
        ) : (
          <div className="lab-workspace__stage lab-workspace__stage--empty">
            <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.previewIntroOnly}</p>
            {experiment.content ? (
              <p className="text-sm text-slate-400 mt-4 max-w-xl leading-relaxed whitespace-pre-wrap">
                {experiment.content}
              </p>
            ) : null}
          </div>
        )}
      </main>

      <LabExperimentNotesPanel
        experiment={experiment}
        noteBody={noteBody}
        onNoteChange={setNoteBody}
        onSave={handleSave}
        onComplete={handleComplete}
        savedAt={savedAt}
        saveStatus={saveStatus}
        owned={canAccessSteps}
      />
    </div>
  )
}
