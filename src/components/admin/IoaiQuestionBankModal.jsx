import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import AdminField from './AdminField'
import AdminRichTextEditor from './AdminRichTextEditor'
import IoaiQuestionAdminPreview from './IoaiQuestionAdminPreview'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import { useIoaiQuestionBank } from '../../hooks/useIoaiQuestionBank'
import {
  IOAI_OPTION_KEYS,
  IOAI_QUESTION_STATUS,
  IOAI_QUESTION_TYPES,
  IOAI_TRUE_FALSE_OPTIONS,
  downloadBulkImportTemplate,
  formatCorrectAnswer,
  questionTypeLabel,
} from '../../config/ioaiQuestions'
import { stripHtml as stripHtmlUtil } from '../../lib/richHtmlMath'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm'

function TypeBadge({ type }) {
  const colors = {
    [IOAI_QUESTION_TYPES.SINGLE]: 'bg-emerald-100 text-emerald-800',
    [IOAI_QUESTION_TYPES.MULTIPLE]: 'bg-violet-100 text-violet-800',
    [IOAI_QUESTION_TYPES.TRUE_FALSE]: 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors[type] || 'bg-slate-100 text-slate-600'}`}>
      {questionTypeLabel(type)}
    </span>
  )
}

function StatusDot({ status }) {
  const color =
    status === IOAI_QUESTION_STATUS.LIVE
      ? 'bg-emerald-500'
      : status === IOAI_QUESTION_STATUS.DRAFT
        ? 'bg-amber-400'
        : 'bg-slate-300'
  return <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} title={status} />
}

export default function IoaiQuestionBankModal({
  open,
  onClose,
  lessonId,
  lessonTitle = '',
  onCountsChange,
}) {
  const { t } = useAdminLocale()
  const i18nRoot = 'pages.ioaiCurriculum.questionBank'
  const lb = useCallback((key, params) => t(`${i18nRoot}.${key}`, params), [t])

  const bank = useIoaiQuestionBank({
    scopeType: 'lesson',
    scopeId: lessonId,
    enabled: open && Boolean(lessonId),
    onUpdated: (rows) => {
      onCountsChange?.({
        total: rows.length,
        live: rows.filter((r) => r.status === IOAI_QUESTION_STATUS.LIVE).length,
      })
    },
  })

  const [showAnswer, setShowAnswer] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const importFileRef = useRef(null)

  const editorLabels = useMemo(
    () => ({
      bold: lb('editorBold'),
      italic: lb('editorItalic'),
      underline: lb('editorUnderline'),
      bulletList: lb('editorBulletList'),
      numberedList: lb('editorNumberedList'),
      link: lb('editorLink'),
      image: lb('editorImage'),
      formula: lb('editorFormula'),
      code: lb('editorCode'),
      sourceMode: lb('editorSource'),
      visualMode: lb('editorVisual'),
      uploading: lb('editorUploading'),
      linkPrompt: lb('linkPrompt'),
      formulaPrompt: lb('formulaPrompt'),
      formulaBlockPrompt: lb('formulaBlockPrompt'),
    }),
    [lb]
  )

  const answerLabels = useMemo(() => ({ trueLabel: lb('trueLabel'), falseLabel: lb('falseLabel') }), [lb])

  useEffect(() => {
    if (!open) return undefined
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || bank.loading || !bank.items.length || bank.activeId) return
    bank.selectRow(bank.items[0])
  }, [open, bank.loading, bank.items.length])

  if (!open || !lessonId) return null

  const { form, set, stats, activeRow, isNew, activeIndex, items } = bank
  const showOptions = form.question_type !== IOAI_QUESTION_TYPES.TRUE_FALSE
  const previewSource = activeRow || (bank.activeId ? form : null)

  const saveDraft = async () => {
    const ok = await bank.persistForm(IOAI_QUESTION_STATUS.DRAFT)
    if (ok) bank.setSuccess(lb('savedUpdate'))
  }

  const saveLive = async () => {
    const ok = await bank.persistForm(IOAI_QUESTION_STATUS.LIVE)
    if (ok) bank.setSuccess(lb('savedUpdate'))
  }

  const handleDeleteCurrent = async () => {
    if (!activeRow || !confirm(lb('confirmDelete'))) return
    await bank.handleDelete(activeRow.id)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-slate-900/50 p-2 sm:p-4">
      <div className="flex flex-col w-full max-w-[1400px] bg-slate-50 rounded-xl shadow-2xl overflow-hidden max-h-full">
        {/* Header */}
        <header className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">{lb('modalBreadcrumb')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-bingo-dark">{lb('modalTitle')}</h2>
                {stats.live > 0 ? (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {lb('modalEnabledBadge')}
                  </span>
                ) : null}
              </div>
              {lessonTitle ? (
                <p className="text-sm text-slate-500 mt-1">
                  {lb('modalLessonLabel')}: <span className="font-medium text-slate-700">{lessonTitle}</span>
                </p>
              ) : null}
              <p className="text-xs text-slate-400 mt-1">
                {lb('liveCount', { live: stats.live, total: stats.total })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
                {lb('modalClose')}
              </button>
              <button
                type="button"
                disabled={!bank.activeId || bank.saving}
                onClick={saveDraft}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                {lb('saveAsDraft')}
              </button>
              <button
                type="button"
                disabled={!bank.activeId || bank.saving}
                onClick={saveLive}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                {bank.saving ? lb('saving') : lb('saveAndPublish')}
              </button>
              <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 lg:hidden" aria-label={lb('modalClose')}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {bank.success ? (
            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5 mt-3">{bank.success}</p>
          ) : null}
          {bank.error ? (
            <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-1.5 mt-3 whitespace-pre-wrap">{bank.error}</p>
          ) : null}
        </header>

        {/* 3-column body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(240px,280px)_1fr_minmax(260px,300px)] gap-0 overflow-hidden">
          {/* Left — list */}
          <aside className="flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
            <div className="shrink-0 px-3 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-bingo-dark">{lb('listTitle')}</p>
                <p className="text-[11px] text-slate-500">{lb('statTotal', { count: stats.total })}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowImport(true)}
                  className="text-[10px] px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  {lb('bulkImportTitle')}
                </button>
                <button type="button" onClick={bank.startNew} className="inline-flex items-center gap-0.5 btn-primary text-[11px] px-2 py-1">
                  <Plus className="w-3 h-3" />
                  {lb('addQuestion')}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[200px] lg:min-h-0">
              {bank.loading ? (
                <p className="text-xs text-slate-500 p-3">{lb('loading')}</p>
              ) : items.length ? (
                <ul className="divide-y divide-slate-100">
                  {items.map((row, i) => {
                    const active = bank.activeId === row.id
                    return (
                      <li key={row.id}>
                        <button
                          type="button"
                          onClick={() => bank.selectRow(row)}
                          className={`w-full text-left px-3 py-2.5 flex gap-2 hover:bg-slate-50 transition ${
                            active ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" aria-hidden />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-slate-400">Q{i + 1}</span>
                              <TypeBadge type={row.question_type} />
                              <StatusDot status={row.status} />
                            </div>
                            <p className="text-xs text-slate-700 line-clamp-2">{stripHtmlUtil(row.stem_html) || lb('noStem')}</p>
                            <p className="text-[10px] font-mono text-primary mt-0.5">
                              {formatCorrectAnswer(row, answerLabels)}
                            </p>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 mb-2">{lb('empty')}</p>
                  <button type="button" onClick={bank.startNew} className="text-xs text-primary hover:underline">
                    {lb('addQuestion')}
                  </button>
                </div>
              )}
            </div>
            {bank.selected.size > 0 ? (
              <div className="shrink-0 p-2 border-t border-slate-100 flex gap-1">
                <button type="button" onClick={() => bank.bulkStatus(IOAI_QUESTION_STATUS.LIVE)} className="text-[10px] flex-1 py-1 rounded bg-emerald-100 text-emerald-800">
                  {lb('bulkLive')}
                </button>
                <button type="button" onClick={() => bank.bulkStatus(IOAI_QUESTION_STATUS.OFFLINE)} className="text-[10px] flex-1 py-1 rounded bg-slate-100 text-slate-600">
                  {lb('bulkOffline')}
                </button>
              </div>
            ) : null}
          </aside>

          {/* Middle — editor */}
          <main className="flex flex-col min-h-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="shrink-0 px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-semibold text-bingo-dark">{lb('tabEdit')}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-[240px] lg:min-h-0">
              {bank.activeId ? (
                <div className="space-y-4 max-w-2xl">
                  <AdminField label={lb('questionType')}>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(IOAI_QUESTION_TYPES).map((type) => (
                        <label
                          key={type}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${
                            form.question_type === type
                              ? 'border-primary bg-primary/5 text-primary font-semibold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="q_type"
                            className="sr-only"
                            checked={form.question_type === type}
                            onChange={() => set('question_type', type)}
                          />
                          {questionTypeLabel(type)}
                        </label>
                      ))}
                    </div>
                  </AdminField>

                  <AdminField label={lb('stem')}>
                    <AdminRichTextEditor
                      value={form.stem_html}
                      onChange={(html) => set('stem_html', html)}
                      placeholder={lb('stemPlaceholder')}
                      minHeight={100}
                      uploadFolder="questions"
                      labels={editorLabels}
                    />
                  </AdminField>

                  {showOptions ? (
                    <AdminField label={lb('option', { key: 'A' }).replace(' A', '')}>
                      <div className="space-y-2">
                        {IOAI_OPTION_KEYS.map((key) => (
                          <div key={key} className="flex items-start gap-2">
                            <span className="w-7 h-9 flex items-center justify-center text-xs font-bold text-slate-500 bg-slate-100 rounded-lg shrink-0">
                              {key}
                            </span>
                            <div className="flex-1 min-w-0">
                              <AdminRichTextEditor
                                value={form[`option_${key.toLowerCase()}_html`]}
                                onChange={(html) => set(`option_${key.toLowerCase()}_html`, html)}
                                placeholder={lb('optionPlaceholder', { key })}
                                minHeight={48}
                                uploadFolder="questions"
                                labels={editorLabels}
                              />
                            </div>
                            {form.question_type === IOAI_QUESTION_TYPES.SINGLE ? (
                              <input
                                type="radio"
                                name="correct_single"
                                checked={form.correct_single === key}
                                onChange={() => set('correct_single', key)}
                                className="mt-3 shrink-0"
                                title={lb('correctAnswer')}
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={form.correct_multiple.includes(key)}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...form.correct_multiple, key]
                                    : form.correct_multiple.filter((k) => k !== key)
                                  set('correct_multiple', next)
                                }}
                                className="mt-3 shrink-0"
                                title={lb('correctAnswer')}
                              />
                            )}
                          </div>
                        ))}
                        {form.question_type === IOAI_QUESTION_TYPES.MULTIPLE ? (
                          <p className="text-xs text-amber-700">{lb('multipleHint')}</p>
                        ) : null}
                      </div>
                    </AdminField>
                  ) : (
                    <AdminField label={lb('correctAnswer')}>
                      <div className="flex gap-4">
                        {IOAI_TRUE_FALSE_OPTIONS.map((o) => (
                          <label key={o.key} className="flex items-center gap-1.5 text-sm">
                            <input
                              type="radio"
                              name="correct_tf"
                              checked={form.correct_true_false === o.key}
                              onChange={() => set('correct_true_false', o.key)}
                            />
                            {o.key} = {o.key === 'A' ? lb('trueLabel') : lb('falseLabel')}
                          </label>
                        ))}
                      </div>
                    </AdminField>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <AdminField label={lb('score')}>
                      <input type="number" min={0} value={form.score} onChange={(e) => set('score', e.target.value)} className={inputClass} />
                    </AdminField>
                    <AdminField label={lb('sortOrder')}>
                      <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} className={inputClass} />
                    </AdminField>
                  </div>

                  <AdminField label={lb('explanation')}>
                    <AdminRichTextEditor
                      value={form.explanation_html}
                      onChange={(html) => set('explanation_html', html)}
                      placeholder={lb('explanationPlaceholder')}
                      minHeight={72}
                      uploadFolder="questions"
                      labels={editorLabels}
                    />
                  </AdminField>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-slate-400">
                  {lb('selectPrompt')}
                </div>
              )}
            </div>

            {bank.activeId ? (
              <footer className="shrink-0 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/80">
                {!isNew && activeRow ? (
                  <button type="button" onClick={handleDeleteCurrent} className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                    <Trash2 className="w-3.5 h-3.5" />
                    {lb('deleteCurrent')}
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={activeIndex <= 0}
                    onClick={bank.goPrev}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {lb('prevQuestion')}
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex < 0 || activeIndex >= items.length - 1}
                    onClick={bank.goNext}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40"
                  >
                    {lb('nextQuestion')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </footer>
            ) : null}
          </main>

          {/* Right — preview */}
          <aside className="flex flex-col min-h-0 bg-slate-50">
            <div className="shrink-0 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-white">
              <p className="text-sm font-semibold text-bingo-dark">{lb('tabPreview')}</p>
              <label className="inline-flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
                <input type="checkbox" checked={showAnswer} onChange={(e) => setShowAnswer(e.target.checked)} className="rounded" />
                {lb('previewToggle')}
              </label>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-[200px] lg:min-h-0">
              {previewSource ? (
                <IoaiQuestionAdminPreview source={previewSource} scopeType="lesson" showAnswer={showAnswer} />
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">{lb('selectForPreview')}</p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Import overlay */}
      {showImport ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">{lb('bulkImportTitle')}</h4>
              <button type="button" onClick={() => setShowImport(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">{lb('bulkImportHint')}</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
              className="w-full rounded-lg border px-3 py-2 text-xs font-mono"
              placeholder={lb('bulkImportPlaceholder')}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={bank.importing || !importText.trim()}
                onClick={async () => {
                  try {
                    const n = await bank.handleImport(importText)
                    setImportText('')
                    setShowImport(false)
                    bank.setSuccess(lb('bulkImportSuccess', { count: n }))
                  } catch {
                    /* error set in hook */
                  }
                }}
                className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
              >
                {bank.importing ? lb('bulkImporting') : lb('bulkImportRun')}
              </button>
              <button type="button" onClick={() => downloadBulkImportTemplate('lesson')} className="text-xs px-3 py-1.5 border rounded-lg">
                {lb('downloadTemplate')}
              </button>
              <button type="button" onClick={() => importFileRef.current?.click()} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border rounded-lg">
                <Upload className="w-3 h-3" />
                {lb('chooseJsonFile')}
              </button>
              <input ref={importFileRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const r = new FileReader()
                r.onload = () => setImportText(String(r.result || ''))
                r.readAsText(f)
              }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
