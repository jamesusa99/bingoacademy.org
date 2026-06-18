import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Eye, FileText, ListChecks, Plus, Upload, X } from 'lucide-react'
import AdminField from './AdminField'
import AdminRichTextEditor from './AdminRichTextEditor'
import IoaiQuestionAdminPreview from './IoaiQuestionAdminPreview'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import {
  IOAI_OPTION_KEYS,
  IOAI_QUESTION_STATUS,
  IOAI_QUESTION_TYPES,
  IOAI_TRUE_FALSE_OPTIONS,
  downloadBulkImportTemplate,
  emptyQuestionForm,
  formatCorrectAnswer,
  formToQuestionRow,
  parseBulkImportJson,
  questionBankStats,
  questionTypeLabel,
  rowToQuestionForm,
  validateIoaiQuestionPayload,
} from '../../config/ioaiQuestions'
import { stripHtml as stripHtmlUtil } from '../../lib/richHtmlMath'
import {
  bulkImportQuestions,
  bulkUpdateQuestionStatus,
  deleteQuestion,
  fetchQuestionsForScope,
  saveQuestion,
} from '../../lib/ioaiQuestionsAdmin'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
const WORKBENCH_H = 'min-h-[420px] max-h-[min(680px,65vh)]'

function StatusBadge({ status, lb }) {
  const map = {
    [IOAI_QUESTION_STATUS.LIVE]: 'bg-emerald-100 text-emerald-800',
    [IOAI_QUESTION_STATUS.DRAFT]: 'bg-amber-100 text-amber-800',
    [IOAI_QUESTION_STATUS.OFFLINE]: 'bg-slate-200 text-slate-600',
  }
  const label =
    status === IOAI_QUESTION_STATUS.LIVE
      ? lb('statusLive')
      : status === IOAI_QUESTION_STATUS.OFFLINE
        ? lb('statusOffline')
        : lb('statusDraft')
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${map[status] || map.draft}`}>
      {label}
    </span>
  )
}

function TypeBadge({ type }) {
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-800 shrink-0">
      {questionTypeLabel(type)}
    </span>
  )
}

function StatsBar({ stats, lb }) {
  return (
    <div className="flex flex-wrap gap-2 text-[11px]">
      <span className="px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium">
        {lb('statTotal', { count: stats.total })}
      </span>
      <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium">
        {lb('statLive', { count: stats.live })}
      </span>
      <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-800 font-medium">
        {lb('statDraft', { count: stats.draft })}
      </span>
      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
        {lb('statOffline', { count: stats.offline })}
      </span>
      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
        {lb('statLiveScore', { score: stats.liveScore })}
      </span>
    </div>
  )
}

function QuestionEditorForm({ form, set, showOptions, editorLabels, lb, inputClass }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <AdminField label={lb('questionType')}>
        <select value={form.question_type} onChange={(e) => set('question_type', e.target.value)} className={inputClass}>
          {Object.values(IOAI_QUESTION_TYPES).map((type) => (
            <option key={type} value={type}>
              {questionTypeLabel(type)}
            </option>
          ))}
        </select>
      </AdminField>
      <AdminField label={lb('status')}>
        <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
          <option value={IOAI_QUESTION_STATUS.DRAFT}>{lb('statusDraft')}</option>
          <option value={IOAI_QUESTION_STATUS.LIVE}>{lb('statusLive')}</option>
          <option value={IOAI_QUESTION_STATUS.OFFLINE}>{lb('statusOffline')}</option>
        </select>
      </AdminField>
      <AdminField label={lb('score')}>
        <input type="number" min={0} value={form.score} onChange={(e) => set('score', e.target.value)} className={inputClass} />
      </AdminField>
      <AdminField label={lb('sortOrder')}>
        <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} className={inputClass} />
      </AdminField>
      <AdminField label={lb('stem')} className="sm:col-span-2">
        <AdminRichTextEditor
          value={form.stem_html}
          onChange={(html) => set('stem_html', html)}
          placeholder={lb('stemPlaceholder')}
          minHeight={88}
          uploadFolder="questions"
          labels={editorLabels}
        />
      </AdminField>
      {showOptions
        ? IOAI_OPTION_KEYS.map((key) => (
            <AdminField key={key} label={lb('option', { key })} className="sm:col-span-2">
              <AdminRichTextEditor
                value={form[`option_${key.toLowerCase()}_html`]}
                onChange={(html) => set(`option_${key.toLowerCase()}_html`, html)}
                placeholder={lb('optionPlaceholder', { key })}
                minHeight={56}
                uploadFolder="questions"
                labels={editorLabels}
              />
            </AdminField>
          ))
        : null}
      <AdminField label={lb('correctAnswer')} className="sm:col-span-2">
        {form.question_type === IOAI_QUESTION_TYPES.SINGLE ? (
          <div className="flex flex-wrap gap-3">
            {IOAI_OPTION_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-1 text-sm">
                <input type="radio" name="correct_single" checked={form.correct_single === key} onChange={() => set('correct_single', key)} />
                {key}
              </label>
            ))}
          </div>
        ) : null}
        {form.question_type === IOAI_QUESTION_TYPES.MULTIPLE ? (
          <div className="space-y-1">
            <p className="text-xs text-amber-700">{lb('multipleHint')}</p>
            <div className="flex flex-wrap gap-3">
              {IOAI_OPTION_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={form.correct_multiple.includes(key)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.correct_multiple, key]
                        : form.correct_multiple.filter((k) => k !== key)
                      set('correct_multiple', next)
                    }}
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {form.question_type === IOAI_QUESTION_TYPES.TRUE_FALSE ? (
          <div className="flex gap-4">
            {IOAI_TRUE_FALSE_OPTIONS.map((o) => (
              <label key={o.key} className="flex items-center gap-1 text-sm">
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
        ) : null}
      </AdminField>
      <AdminField label={lb('explanation')} className="sm:col-span-2">
        <AdminRichTextEditor
          value={form.explanation_html}
          onChange={(html) => set('explanation_html', html)}
          placeholder={lb('explanationPlaceholder')}
          minHeight={64}
          uploadFolder="questions"
          labels={editorLabels}
        />
      </AdminField>
    </div>
  )
}

export default function IoaiQuestionBankPanel({
  scopeType,
  scopeId,
  i18nRoot = 'pages.ioaiCurriculum.questionBank',
}) {
  const { t } = useAdminLocale()
  const lb = useCallback((key, params) => t(`${i18nRoot}.${key}`, params), [i18nRoot, t])

  const title = scopeType === 'module' ? lb('moduleTitle') : lb('lessonTitle')
  const hint = scopeType === 'module' ? lb('moduleHint') : lb('lessonHint')

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

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [importError, setImportError] = useState(null)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [rightTab, setRightTab] = useState('edit')
  const [form, setForm] = useState(() => emptyQuestionForm(scopeType))
  const [selected, setSelected] = useState(() => new Set())
  const importFileRef = useRef(null)

  const stats = useMemo(() => questionBankStats(items), [items])
  const activeRow = useMemo(() => items.find((r) => r.id === activeId) || null, [items, activeId])
  const isNew = activeId === '__new__'
  const showOptions = form.question_type !== IOAI_QUESTION_TYPES.TRUE_FALSE

  const reload = useCallback(async () => {
    if (!scopeId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const rows = await fetchQuestionsForScope(scopeType, scopeId)
      setItems(rows)
      setError(null)
      setSuccess(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [scopeType, scopeId])

  useEffect(() => {
    reload()
  }, [reload])

  const startNew = () => {
    setActiveId('__new__')
    setForm(emptyQuestionForm(scopeType))
    setRightTab('edit')
  }

  const selectRow = (row) => {
    setActiveId(row.id)
    setForm(rowToQuestionForm(row))
  }

  const resetSelection = () => {
    setActiveId(null)
    setForm(emptyQuestionForm(scopeType))
  }

  const handleSave = async () => {
    const errors = validateIoaiQuestionPayload(form)
    if (errors.length) {
      setError(errors.join('；'))
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = formToQuestionRow(form, scopeType, scopeId)
      const savedId = await saveQuestion(isNew ? null : activeId, payload)
      await reload()
      setActiveId(savedId || activeId)
      setSuccess(isNew ? lb('savedNew') : lb('savedUpdate'))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(lb('confirmDelete'))) return
    await deleteQuestion(id)
    if (activeId === id) resetSelection()
    await reload()
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkStatus = async (status) => {
    if (!selected.size) return
    await bulkUpdateQuestionStatus([...selected], status)
    setSelected(new Set())
    await reload()
  }

  const handleImport = async () => {
    setImportError(null)
    setImporting(true)
    try {
      const forms = parseBulkImportJson(importText)
      const ids = await bulkImportQuestions(scopeType, scopeId, forms)
      setImportText('')
      setShowImport(false)
      await reload()
      setSuccess(lb('bulkImportSuccess', { count: ids.length }))
    } catch (e) {
      setImportError(e.message)
    } finally {
      setImporting(false)
    }
  }

  const handleImportFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImportText(String(reader.result || ''))
    reader.onerror = () => setImportError('Failed to read file')
    reader.readAsText(file)
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const previewSource = activeRow || (isNew || activeId ? form : null)

  const tabs = [
    { id: 'edit', label: lb('tabEdit'), icon: FileText },
    { id: 'preview', label: lb('tabPreview'), icon: Eye },
    { id: 'answers', label: lb('tabAnswerSheet'), icon: ListChecks },
  ]

  if (!scopeId) return null

  return (
    <div className="rounded-xl border border-violet-200/80 bg-violet-50/30 p-4 space-y-3">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-bingo-dark text-sm">{title}</h3>
            {hint ? <p className="text-xs text-slate-500 mt-0.5">{hint}</p> : null}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={startNew} className="inline-flex items-center gap-1 btn-primary text-xs px-3 py-1.5">
              <Plus className="w-3.5 h-3.5" />
              {lb('addQuestion')}
            </button>
            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {lb('bulkImportTitle')}
            </button>
          </div>
        </div>
        <StatsBar stats={stats} lb={lb} />
      </div>

      {success ? <div className="text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2">{success}</div> : null}
      {error ? <div className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 whitespace-pre-wrap">{error}</div> : null}

      {/* Workbench */}
      <div className={`grid lg:grid-cols-[minmax(260px,300px)_1fr] gap-3 ${WORKBENCH_H}`}>
        {/* Left: question list */}
        <div className="flex flex-col min-h-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">{lb('listTitle')}</span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={!selected.size}
                onClick={() => bulkStatus(IOAI_QUESTION_STATUS.LIVE)}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 disabled:opacity-40"
              >
                {lb('bulkLive')}
              </button>
              <button
                type="button"
                disabled={!selected.size}
                onClick={() => bulkStatus(IOAI_QUESTION_STATUS.OFFLINE)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 disabled:opacity-40"
              >
                {lb('bulkOffline')}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <p className="text-xs text-slate-500 p-3">{lb('loading')}</p>
            ) : items.length ? (
              <ul className="divide-y divide-slate-100">
                {items.map((row, i) => {
                  const active = activeId === row.id
                  const answer = formatCorrectAnswer(row, answerLabels)
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => selectRow(row)}
                        className={`w-full text-left px-3 py-2.5 transition hover:bg-slate-50 ${
                          active ? 'bg-violet-50 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selected.has(row.id)}
                            onChange={() => toggleSelect(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              <span className="text-[10px] font-bold text-slate-400">Q{(row.sort_order ?? i) + 1}</span>
                              <TypeBadge type={row.question_type} />
                              <StatusBadge status={row.status} lb={lb} />
                              <span className="text-[10px] text-slate-400 ml-auto">{row.score}{lb('colScore')}</span>
                            </div>
                            <p className="text-xs text-slate-700 line-clamp-2 leading-snug">
                              {stripHtmlUtil(row.stem_html) || lb('noStem')}
                            </p>
                            <p className="text-[10px] font-mono text-primary mt-1">
                              {lb('answerShort')}: {answer}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-2">{lb('empty')}</p>
                <button type="button" onClick={startNew} className="text-xs text-primary hover:underline">
                  {lb('addQuestion')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: edit / preview / answer sheet */}
        <div className="flex flex-col min-h-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="shrink-0 flex border-b border-slate-100">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRightTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
                  rightTab === id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-4">
            {rightTab === 'edit' ? (
              activeId ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500">
                    {isNew ? lb('editingNew') : lb('editingExisting', { n: (activeRow?.sort_order ?? 0) + 1 })}
                  </p>
                  <QuestionEditorForm
                    form={form}
                    set={set}
                    showOptions={showOptions}
                    editorLabels={editorLabels}
                    lb={lb}
                    inputClass={inputClass}
                  />
                  <div className="sticky bottom-0 flex flex-wrap gap-2 pt-2 pb-1 bg-white border-t border-slate-100">
                    <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                      {saving ? lb('saving') : isNew ? lb('save') : lb('update')}
                    </button>
                    {!isNew && activeRow ? (
                      <button type="button" onClick={() => handleDelete(activeRow.id)} className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl">
                        {lb('delete')}
                      </button>
                    ) : null}
                    <button type="button" onClick={resetSelection} className="text-sm px-4 py-2 border rounded-xl">
                      {lb('cancelEdit')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-center px-4">
                  <p className="text-sm text-slate-500 mb-3">{lb('selectPrompt')}</p>
                  <button type="button" onClick={startNew} className="btn-primary text-sm px-4 py-2">
                    {lb('addQuestion')}
                  </button>
                </div>
              )
            ) : null}

            {rightTab === 'preview' ? (
              previewSource ? (
                <IoaiQuestionAdminPreview source={previewSource} scopeType={scopeType} showAnswer />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[240px] text-sm text-slate-400">
                  {lb('selectForPreview')}
                </div>
              )
            ) : null}

            {rightTab === 'answers' ? (
              items.length ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-3">{lb('answerSheetHint')}</p>
                  {items.map((row, i) => (
                    <div
                      key={row.id}
                      className={`rounded-lg border p-3 text-xs cursor-pointer hover:border-primary/40 transition ${
                        activeId === row.id ? 'border-primary bg-primary/5' : 'border-slate-200'
                      }`}
                      onClick={() => selectRow(row)}
                      onKeyDown={(e) => e.key === 'Enter' && selectRow(row)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-slate-500">Q{(row.sort_order ?? i) + 1}</span>
                        <TypeBadge type={row.question_type} />
                        <StatusBadge status={row.status} lb={lb} />
                        <span className="text-slate-400">{row.score}{lb('colScore')}</span>
                        <span className="ml-auto font-mono font-semibold text-primary">
                          {formatCorrectAnswer(row, answerLabels)}
                        </span>
                      </div>
                      <p className="text-slate-700 line-clamp-2">{stripHtmlUtil(row.stem_html)}</p>
                      {row.explanation_html ? (
                        <p className="text-slate-500 mt-1 line-clamp-1">
                          {lb('explanation')}: {stripHtmlUtil(row.explanation_html)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{lb('empty')}</p>
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* Import modal */}
      {showImport ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl p-5 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{lb('bulkImportTitle')}</h4>
              <button type="button" onClick={() => setShowImport(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">{lb('bulkImportHint')}</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              placeholder={lb('bulkImportPlaceholder')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
            />
            {importError ? <p className="text-xs text-red-600 whitespace-pre-wrap">{importError}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={importing || !importText.trim()}
                onClick={handleImport}
                className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
              >
                {importing ? lb('bulkImporting') : lb('bulkImportRun')}
              </button>
              <button type="button" onClick={() => downloadBulkImportTemplate(scopeType)} className="text-xs px-3 py-1.5 rounded-lg border">
                {lb('downloadTemplate')}
              </button>
              <button type="button" onClick={() => importFileRef.current?.click()} className="text-xs px-3 py-1.5 rounded-lg border">
                {lb('chooseJsonFile')}
              </button>
              <input ref={importFileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0])} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
