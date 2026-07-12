import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getQuestionsForPaper, getResult } from '../../data/assessmentQuestionBanks'
import { saveAssessmentRecord } from '../../lib/assessmentRecords'
import { trackConversion } from '../../lib/analytics'
import { recordAssessmentAccomplishments } from '../../lib/userAccomplishments'
import { useAuth } from '../../contexts/AuthContext'
import { ASSESSMENT_PORTAL } from '../../config/assessmentPortal'

function Results({ score, total, result, paper, onBack }) {
  const { user } = useAuth()

  useEffect(() => {
    const record = {
      id: `${paper.id}-${Date.now()}`,
      assessmentId: paper.id,
      title: paper.title,
      pct: result.pct,
      level: result.level,
      score,
      total,
      at: Date.now(),
    }
    saveAssessmentRecord(record)
    trackConversion('assessment_complete', { assessment_id: paper.id, score_pct: result.pct })
    if (user?.id) {
      recordAssessmentAccomplishments(user.id, record)
    }
  }, [paper.id, paper.title, result.pct, result.level, score, total, user?.id])

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-primary transition mb-6 flex items-center gap-1"
      >
        ← Back to Assessment Center
      </button>

      <section className="section-tech rounded-2xl px-6 py-10 mb-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
        <div className="relative">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-sm font-medium text-primary mb-2">Assessment complete</p>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/30 bg-white/80 mb-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{result.pct}</span>
              <span className="text-xl font-semibold text-primary">%</span>
            </div>
          </div>
          <div className={`inline-block text-sm font-semibold px-5 py-2 rounded-full border mb-3 ${result.color}`}>
            {result.level}
          </div>
          <p className="text-slate-600 text-sm mb-1">
            {score} / {total} {ASSESSMENT_PORTAL.correctCount}
          </p>
          <p className="text-xs text-slate-500 mb-0">{paper.title}</p>
        </div>
      </section>

      <div className="card p-5 mb-6 border-l-4 border-primary">
        <p className="text-slate-700 text-sm leading-relaxed">{result.feedback}</p>
      </div>

      <section className="card p-6 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-1">AI capability map</h3>
        <p className="text-xs text-slate-500 mb-5">Multi-dimensional breakdown</p>
        <div className="space-y-5">
          {result.dimScores.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700">{d.label}</span>
                <span className="font-semibold text-primary">{d.score}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${result.pct >= 80 ? 'bg-green-600' : result.pct >= 55 ? 'bg-primary' : 'bg-amber-500'}`}
                  style={{ width: `${d.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 mb-6 border-primary/20 bg-gradient-to-br from-cyan-50/80 to-primary/5">
        <h3 className="font-semibold text-bingo-dark mb-1">Recommended for you</h3>
        <p className="text-xs text-slate-500 mb-4">Based on your results · 3 matched courses</p>
        <div className="space-y-3 mb-4">
          {result.courses.map((c, i) => (
            <Link
              key={i}
              to="/courses"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/70 hover:bg-white border border-slate-100 hover:border-primary/20 transition"
            >
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-slate-800 hover:text-primary transition">{c}</span>
              <span className="ml-auto text-primary text-xs">View →</span>
            </Link>
          ))}
        </div>
        <Link to="/courses" className="btn-primary w-full py-3 text-sm font-medium rounded-xl">
          View all courses →
        </Link>
      </section>

      <p className="text-xs text-center text-slate-500 mb-6">
        This result was saved in your browser. View it under &quot;{ASSESSMENT_PORTAL.tabs.records}&quot;.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-medium hover:bg-primary/5 transition"
        >
          Try another assessment
        </button>
        <Link to="/courses" className="btn-primary px-5 py-2.5 text-sm font-medium rounded-xl">
          {ASSESSMENT_PORTAL.coursesEnroll}
        </Link>
        <Link
          to="/cert"
          className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
        >
          Certification center
        </Link>
      </div>
    </div>
  )
}

export default function AssessmentQuiz({ paper, onBack }) {
  const questions = getQuestionsForPaper(paper)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)

  const q = questions[current]
  const progress = questions.length ? Math.round((current / questions.length) * 100) : 0

  if (!questions.length) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p className="text-slate-600 mb-4">Questions for this assessment are not configured yet.</p>
        <button type="button" onClick={onBack} className="btn-primary px-6 py-2.5">
          Back to Assessment Center
        </button>
      </div>
    )
  }

  const handleSelect = (idx) => {
    if (confirmed) return
    setSelected(idx)
  }

  const handleConfirm = () => {
    if (selected === null) return
    setConfirmed(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, { selected, correct: selected === q.answer }]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
      setConfirmed(false)
    }
  }

  if (done) {
    const score = answers.filter((a) => a.correct).length
    const result = getResult(score, questions.length, paper.questionBank)
    return <Results score={score} total={questions.length} result={result} paper={paper} onBack={onBack} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-primary transition flex items-center gap-1"
        >
          ← Back
        </button>
        <span className="text-sm text-slate-500 font-medium">
          Question {current + 1} / {questions.length}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4 truncate">{paper.title}</p>

      <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="card p-6 mb-4">
        <h3 className="font-semibold text-bingo-dark text-base mb-6 leading-relaxed whitespace-pre-line">{q.q}</h3>
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let style = 'border border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary/5'
            if (selected === idx && !confirmed) style = 'border-2 border-primary bg-primary/5 text-primary font-medium'
            if (confirmed) {
              if (idx === q.answer) style = 'border-2 border-green-500 bg-green-50 text-green-700 font-medium'
              else if (idx === selected && selected !== q.answer)
                style = 'border-2 border-red-400 bg-red-50 text-red-600'
              else style = 'border border-slate-200 text-slate-400'
            }
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`w-full text-left rounded-xl px-4 py-3 text-sm transition ${style}`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            )
          })}
        </div>

        {confirmed && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${selected === q.answer ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          >
            {selected === q.answer ? '✓ Correct!' : `✗ The correct answer is: ${q.options[q.answer]}`}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {!confirmed ? (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected === null}
            className="btn-primary px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm answer
          </button>
        ) : (
          <button type="button" onClick={handleNext} className="btn-primary px-6 py-2.5">
            {current + 1 < questions.length ? 'Next question →' : 'See results →'}
          </button>
        )}
      </div>
    </div>
  )
}
