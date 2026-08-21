import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import IoaiRadarChart from './IoaiRadarChart'
import LeadEmailCapture from '../../landing/LeadEmailCapture'
import {
  IOAI_ASSESSMENT_COPY,
  IOAI_DIMENSIONS,
  IOAI_GATES,
  IOAI_GATE_STATUS,
  IOAI_STAGES,
  fullTrackHref,
  recommendedStageHref,
} from '../../../config/ioaiAssessment'
import { formatIoaiPrice } from '../../../lib/ioaiStore'

function dimensionDiagnosis(percent) {
  if (percent >= 75) return 'Strong coverage on this snapshot.'
  if (percent >= 50) return 'Partial coverage — review the related module.'
  return 'Earliest gap on this snapshot — start here if it maps to your recommended stage.'
}

export default function IoaiAssessmentResults({
  result,
  modules,
  bundle,
  onRetake,
  onRecommendClick,
  onFullTrackClick,
  onEmailSubmit,
}) {
  const copy = IOAI_ASSESSMENT_COPY.results
  const stage = IOAI_STAGES[result.recommendedStage]
  const failedGate = IOAI_GATES.find((g) => g.id === result.failedGate)
  const radarValues = IOAI_DIMENSIONS.map((dim) => ({
    id: dim.id,
    label: dim.label,
    shortLabel: dim.label.replace('Programming & Data', 'Prog. & Data').replace('Computer Vision', 'Vision'),
    value: result.dimensionScores[dim.id]?.percent ?? 0,
  }))

  const priceLabel =
    bundle?.priceCents > 0 ? formatIoaiPrice(bundle.priceCents, bundle.currency) : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 sm:p-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700 mb-2">{copy.heroKicker}</p>
        <h1 className="text-3xl sm:text-4xl font-black text-bingo-dark mb-2">{stage?.name}</h1>
        <p className="text-sm font-semibold text-primary mb-4">{stage?.title}</p>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
          {failedGate
            ? `You have a useful start on IOAI study. Your earliest gap is in ${failedGate.label.toLowerCase()}, so ${stage?.name} is the recommended starting stage.`
            : 'You passed every course gate on this snapshot. AI Olympiad is the recommended starting stage.'}
        </p>
        <p className="text-xs text-slate-500">
          {copy.basedOn} · {copy.questionsAnswered(result.correctCount, 15)} · {copy.timeLabel(result.elapsedSeconds)}
        </p>
        <p className="text-[11px] text-slate-400 mt-3 max-w-xl mx-auto">
          This is syllabus coverage from a short assessment — not an official IOAI score or certified level.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-bold text-bingo-dark mb-1">Course gates</h2>
        <p className="text-xs text-slate-500 mb-4">{copy.gateHighlight}</p>
        <div className="space-y-3">
          {IOAI_GATES.map((gate) => {
            const score = result.gateScores[gate.id]
            const statusKey = score.correct >= 4 ? 'passed' : score.correct >= 3 ? 'developing' : 'needs_work'
            const status = IOAI_GATE_STATUS[statusKey]
            const highlight = result.failedGate === gate.id
            return (
              <div
                key={gate.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  highlight ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                }`}
              >
                <div>
                  <p className="font-semibold text-bingo-dark">{gate.label}</p>
                  <p className="text-xs text-slate-500">{gate.hint}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-sm font-bold">
                    {score.correct}/{score.total}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {result.nonMonotonic ? (
          <p className="text-sm text-slate-600 mt-4 leading-relaxed">{copy.nonMonotonic}</p>
        ) : null}
      </section>

      <section className="card p-6">
        <h2 className="font-bold text-bingo-dark mb-1">{copy.radarTitle}</h2>
        <p className="text-xs text-slate-500 mb-4">Evidence counts are shown with each dimension — not a precise ability score.</p>
        <IoaiRadarChart values={radarValues} />
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {IOAI_DIMENSIONS.map((dim) => {
            const score = result.dimensionScores[dim.id]
            return (
              <article key={dim.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-bingo-dark text-sm">{dim.label}</h3>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {score.percent}% · {copy.coverageCardHint(score.correct, score.total)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{dim.officialTopics}</p>
                <p className="text-xs text-slate-700">{dimensionDiagnosis(score.percent)}</p>
              </article>
            )
          })}
        </div>
        {result.audioGap ? <p className="text-xs text-slate-500 mt-4 leading-relaxed">{copy.audioGap}</p> : null}
      </section>

      <section className="card p-6">
        <h2 className="font-bold text-bingo-dark mb-4">Course roadmap</h2>
        <ol className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          {Object.values(IOAI_STAGES).map((item, index, list) => {
            const active = item.id === result.recommendedStage
            return (
              <li key={item.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`rounded-xl px-3 py-2 text-sm font-semibold border ${
                    active ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {item.name}
                  {active ? <span className="block text-[10px] font-medium">{copy.roadmapCaption}</span> : null}
                </div>
                {index < list.length - 1 ? (
                  <span className="hidden sm:inline text-slate-300 px-1" aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      </section>

      <section className="rounded-2xl border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-50 to-white p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 mb-2">Recommended course</p>
        <h2 className="text-2xl font-black text-bingo-dark mb-2">{bundle?.title || `${stage?.name} — All units`}</h2>
        <p className="text-sm text-slate-600 mb-4">{stage?.outcome}</p>
        {modules.length ? (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Start with these units from this snapshot</p>
            <ul className="space-y-2">
              {modules.map((mod) => (
                <li key={mod.catalogSlug}>
                  <Link to={mod.href} className="text-sm font-medium text-primary hover:underline">
                    {mod.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {priceLabel ? (
          <p className="text-xl font-black text-bingo-dark mb-1">{priceLabel}</p>
        ) : (
          <p className="text-sm text-slate-500 mb-1">See current pricing on the program page.</p>
        )}
        {bundle?.moduleCount ? (
          <p className="text-xs text-slate-500 mb-5">
            {bundle.moduleCount} units · {bundle.lessonCount} lessons · one-time access
          </p>
        ) : (
          <p className="text-xs text-slate-500 mb-5">One-time · lifetime access</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Link
            to={recommendedStageHref(result.recommendedStage)}
            onClick={onRecommendClick}
            className="btn-primary px-5 py-3 text-sm font-bold rounded-xl inline-flex items-center gap-2"
          >
            {copy.primaryCta(stage?.name)}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
          <Link
            to={fullTrackHref()}
            onClick={onFullTrackClick}
            className="px-5 py-3 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-white"
          >
            {copy.secondaryCta}
          </Link>
        </div>
      </section>

      <LeadEmailCapture
        source="ioai_assessment"
        campaign="ioai_readiness_v1"
        title={copy.emailTitle}
        subtitle={copy.emailSubtitle}
        cta={copy.emailCta}
        successMessage={copy.emailSuccess}
        onSuccess={onEmailSubmit}
      />

      <div className="text-center">
        <button type="button" onClick={onRetake} className="text-sm text-slate-500 hover:text-primary">
          {copy.retake}
        </button>
      </div>
    </div>
  )
}
