import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageContent from '../components/PageContent'
import AssessmentQuiz from '../components/assessment/AssessmentQuiz'
import { ASSESSMENT_PORTAL } from '../config/assessmentPortal'
import {
  ASSESSMENT_CATALOG,
  getAssessmentById,
  formatPriceLabel,
} from '../config/assessmentCatalog'
import { loadAssessmentRecords, clearAssessmentRecords } from '../lib/assessmentRecords'

function AssessmentPaperCard({ paper, onStart, onShare }) {
  const price = formatPriceLabel(paper)
  return (
    <article className="card p-5 sm:p-6 flex flex-col h-full hover:border-[#2081a2]/30 transition border border-slate-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-bingo-dark text-base leading-snug">{paper.title}</h3>
        <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
          {ASSESSMENT_PORTAL.freeBadge}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-lg font-bold text-[#2081a2]">{price.show}</span>
        {paper.free && (
          <span className="text-sm text-slate-400 line-through">${paper.priceOriginal}</span>
        )}
      </div>
      {paper.gradeHint && (
        <p className="text-xs text-slate-500 mb-2">
          {ASSESSMENT_PORTAL.suitableFor}: {paper.gradeHint}
        </p>
      )}
      <p className="text-sm text-slate-600 mb-4 flex-1 leading-relaxed">{paper.desc}</p>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
        <span>
          ⏱ {ASSESSMENT_PORTAL.approxMin} {paper.durationMin} {ASSESSMENT_PORTAL.min}
        </span>
        <span>
          📝 {paper.questionCount} {ASSESSMENT_PORTAL.questions}
        </span>
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          type="button"
          onClick={() => onStart(paper.id)}
          className="flex-1 btn-primary text-sm py-2.5 rounded-xl font-medium min-h-[44px]"
        >
          {ASSESSMENT_PORTAL.startAssessment}
        </button>
        <button
          type="button"
          onClick={() => onShare(paper)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition min-h-[44px]"
        >
          {ASSESSMENT_PORTAL.share}
        </button>
      </div>
    </article>
  )
}

function ShareToast({ message, onClose }) {
  if (!message) return null
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-bingo-dark text-white text-sm px-5 py-3 rounded-xl shadow-lg"
      role="status"
    >
      {message}
      <button type="button" className="ml-3 opacity-70 hover:opacity-100" onClick={onClose}>
        ×
      </button>
    </div>
  )
}

function RecordsPanel({ onStart }) {
  const [records, setRecords] = useState(() => loadAssessmentRecords())

  const refresh = useCallback(() => setRecords(loadAssessmentRecords()), [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key?.includes('bingo-assessment')) refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  if (!records.length) {
    return (
      <div className="card p-12 text-center">
        <p className="text-4xl mb-4 opacity-40">📋</p>
        <p className="text-slate-600 text-sm max-w-md mx-auto">{ASSESSMENT_PORTAL.emptyRecords}</p>
        <button
          type="button"
          onClick={() => onStart(ASSESSMENT_CATALOG[0]?.id)}
          className="btn-primary mt-6 px-6 py-2.5 text-sm"
        >
          {ASSESSMENT_PORTAL.browseAssessments}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(ASSESSMENT_PORTAL.clearRecordsConfirm)) {
              clearAssessmentRecords()
              refresh()
            }
          }}
          className="text-xs text-slate-500 hover:text-red-600 transition"
        >
          {ASSESSMENT_PORTAL.clearRecords}
        </button>
      </div>
      {records.map((r) => (
        <div
          key={r.id}
          className="card p-4 sm:p-5 flex flex-wrap items-center gap-4 justify-between hover:border-primary/20 transition"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-bingo-dark text-sm truncate">{r.title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(r.at).toLocaleString('en-US')} · {r.score}/{r.total} {ASSESSMENT_PORTAL.correctCount} · {r.level}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-[#2081a2]">{r.pct}%</span>
            <button
              type="button"
              onClick={() => onStart(r.assessmentId)}
              className="text-sm text-primary font-medium hover:underline"
            >
              {ASSESSMENT_PORTAL.retake}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AIAssessment() {
  const [searchParams, setSearchParams] = useSearchParams()
  const paperParam = searchParams.get('paper') || searchParams.get('start')
  const [tab, setTab] = useState('catalog')
  const [activePaperId, setActivePaperId] = useState(null)
  const [toast, setToast] = useState('')

  const activePaper = activePaperId ? getAssessmentById(activePaperId) : null

  useEffect(() => {
    if (paperParam && getAssessmentById(paperParam)) {
      setActivePaperId(paperParam)
    }
  }, [paperParam])

  const startAssessment = (id) => {
    setActivePaperId(id)
    setSearchParams({ paper: id }, { replace: true })
  }

  const exitQuiz = () => {
    setActivePaperId(null)
    setSearchParams({}, { replace: true })
  }

  const handleShare = async (paper) => {
    const url = `${window.location.origin}/assessment?paper=${paper.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: paper.title, text: paper.desc, url })
        return
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(url)
      setToast(ASSESSMENT_PORTAL.shareCopied)
      setTimeout(() => setToast(''), 3000)
    } catch {
      setToast(url)
      setTimeout(() => setToast(''), 5000)
    }
  }

  if (activePaper) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-[#2081a2]/10 via-cyan-50/50 to-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <nav className="text-xs text-slate-500 mb-2" aria-label={ASSESSMENT_PORTAL.ariaBreadcrumb}>
              <Link to="/courses" className="hover:text-[#2081a2]">
                {ASSESSMENT_PORTAL.breadcrumb[0].label}
              </Link>
              <span className="mx-2">/</span>
              <button type="button" onClick={exitQuiz} className="hover:text-[#2081a2]">
                {ASSESSMENT_PORTAL.title}
              </button>
              <span className="mx-2">/</span>
              <span className="text-slate-700">{ASSESSMENT_PORTAL.inQuiz}</span>
            </nav>
            <h1 className="text-xl font-bold text-bingo-dark">{activePaper.title}</h1>
          </div>
        </div>
        <PageContent className="py-8 max-w-7xl mx-auto">
          <AssessmentQuiz paper={activePaper} onBack={exitQuiz} />
        </PageContent>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ShareToast message={toast} onClose={() => setToast('')} />

      <header className="bg-gradient-to-br from-[#2081a2]/12 via-cyan-50/80 to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <nav className="text-xs text-slate-500 mb-4" aria-label={ASSESSMENT_PORTAL.ariaBreadcrumb}>
            {ASSESSMENT_PORTAL.breadcrumb.map((item, i) => (
              <span key={item.label}>
                {i > 0 && <span className="mx-2">/</span>}
                {item.to ? (
                  <Link to={item.to} className="hover:text-[#2081a2]">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-3">{ASSESSMENT_PORTAL.title}</h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            {ASSESSMENT_PORTAL.subtitle}
          </p>
        </div>
      </header>

      <PageContent className="py-6 sm:py-8 max-w-7xl mx-auto">
        <div
          className="flex border-b border-slate-200 mb-8"
          role="tablist"
          aria-label={ASSESSMENT_PORTAL.ariaTabs}
        >
          {[
            { id: 'catalog', label: ASSESSMENT_PORTAL.tabs.catalog },
            { id: 'records', label: ASSESSMENT_PORTAL.tabs.records },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition min-h-[44px] ${
                tab === t.id
                  ? 'border-[#2081a2] text-[#2081a2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'catalog' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ASSESSMENT_CATALOG.map((paper) => (
              <AssessmentPaperCard
                key={paper.id}
                paper={paper}
                onStart={startAssessment}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <RecordsPanel onStart={startAssessment} />
        )}

        <footer className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap gap-3 justify-center text-sm">
          <Link
            to="/courses"
            className="px-4 py-2 rounded-xl bg-[#2081a2]/10 text-[#2081a2] font-medium hover:bg-[#2081a2]/20 transition"
          >
            {ASSESSMENT_PORTAL.coursesEnroll}
          </Link>
          <Link
            to="/community"
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            {ASSESSMENT_PORTAL.community}
          </Link>
          <Link
            to="/lab"
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            {ASSESSMENT_PORTAL.lab}
          </Link>
        </footer>
      </PageContent>
    </div>
  )
}
