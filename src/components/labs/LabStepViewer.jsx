import { Link } from 'react-router-dom'
import { LAB_EXPERIMENTS_PORTAL, LAB_STEP_TYPES } from '../../config/labExperiments'

function stepTypeLabel(type) {
  return LAB_STEP_TYPES.find((t) => t.id === type)?.label || type
}

function StepVideo({ step, borderClass = 'border-slate-200' }) {
  if (step.videoUrl) {
    return (
      <div className={`rounded-xl overflow-hidden border ${borderClass} aspect-video`}>
        <iframe
          title={step.title || 'Video'}
          src={step.videoUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }
  if (step.cloudflareVideoId) {
    return <p className="text-xs text-slate-500">Cloudflare video: {step.cloudflareVideoId}</p>
  }
  return null
}

export default function LabStepViewer({ step, index, dark = false, workspace = false }) {
  if (!step) return null

  const articleClass = workspace
    ? 'lab-workspace__step-content'
    : dark
      ? 'card-dark-panel p-5'
      : 'card p-5'
  const titleClass = dark ? 'font-semibold text-white text-sm mt-0.5' : 'font-semibold text-bingo-dark text-sm mt-0.5'
  const bodyClass = dark ? 'prose prose-sm max-w-none text-slate-300 whitespace-pre-wrap' : 'prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap'
  const mutedClass = dark ? 'text-sm text-slate-400 whitespace-pre-wrap' : 'text-sm text-slate-600 whitespace-pre-wrap'
  const numClass = dark
    ? 'w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0'
    : 'w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0'
  const videoBorder = dark ? 'border-slate-700' : 'border-slate-200'
  const linkClass = dark
    ? 'inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:underline'
    : 'inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline'
  const btnClass = dark
    ? 'inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-4 py-2 transition'
    : 'inline-flex items-center gap-2 btn-primary text-sm px-4 py-2'

  return (
    <article className={articleClass}>
      <div className="flex items-start gap-3 mb-3">
        <span className={numClass}>{index + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {stepTypeLabel(step.stepType)}
          </p>
          {step.title ? <h3 className={titleClass}>{step.title}</h3> : null}
        </div>
      </div>

      {step.stepType === 'text' && step.body ? (
        <div className={bodyClass}>{step.body}</div>
      ) : null}

      {step.stepType === 'video' ? <StepVideo step={step} borderClass={videoBorder} /> : null}

      {step.stepType === 'ppt' && step.pptUrl ? (
        <a href={step.pptUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {LAB_EXPERIMENTS_PORTAL.openSlides} →
        </a>
      ) : null}

      {step.stepType === 'link' && step.externalUrl ? (
        <a href={step.externalUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {step.body || LAB_EXPERIMENTS_PORTAL.openLink} →
        </a>
      ) : null}

      {step.stepType === 'download' && step.downloadUrl ? (
        <a href={step.downloadUrl} target="_blank" rel="noopener noreferrer" download className={btnClass}>
          {step.downloadLabel || LAB_EXPERIMENTS_PORTAL.downloadFile}
        </a>
      ) : null}

      {step.stepType === 'programming' ? (
        <div className="space-y-3">
          {step.body ? <p className={mutedClass}>{step.body}</p> : null}
          {step.programmingConfig?.labId ? (
            <Link
              to={`/labs/ioai/training-lab/${encodeURIComponent(step.programmingConfig.labId)}`}
              className={btnClass}
            >
              {LAB_EXPERIMENTS_PORTAL.startProgramming} →
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
