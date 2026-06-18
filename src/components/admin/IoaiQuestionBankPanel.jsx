import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminField from './AdminField'
import AdminRichTextEditor from './AdminRichTextEditor'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import {
  IOAI_OPTION_KEYS,
  IOAI_QUESTION_STATUS,
  IOAI_QUESTION_TYPES,
  IOAI_TRUE_FALSE_OPTIONS,
  downloadBulkImportTemplate,
  emptyQuestionForm,
  formToQuestionRow,
  parseBulkImportJson,
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

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [importError, setImportError] = useState(null)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(() => emptyQuestionForm(scopeType))
  const [selected, setSelected] = useState(() => new Set())
  const importFileRef = useRef(null)

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

  const resetForm = () => {
    setEditingId(null)
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
      await saveQuestion(editingId, payload)
      resetForm()
      await reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (row) => {
    setEditingId(row.id)
    setForm(rowToQuestionForm(row))
  }

  const handleDelete = async (id) => {
    if (!confirm(lb('confirmDelete'))) return
    await deleteQuestion(id)
    if (editingId === id) resetForm()
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
  const showOptions = form.question_type !== IOAI_QUESTION_TYPES.TRUE_FALSE
  const liveCount = items.filter((i) => i.status === IOAI_QUESTION_STATUS.LIVE).length

  if (!scopeId) return null

  return (
    <div className="rounded-xl border border-violet-200/80 bg-violet-50/30 p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-bingo-dark text-sm">{title}</h3>
        {hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
        <p className="text-xs text-slate-500 mt-1">
          {lb('liveCount', { live: liveCount, total: items.length })}
        </p>
      </div>

      {success ? <div className="text-sm text-emerald-800 bg-emerald-50 rounded-lg p-2">{success}</div> : null}
      {error ? <div className="text-sm text-red-700 bg-red-50 rounded-lg p-2 whitespace-pre-wrap">{error}</div> : null}

      <div className="grid sm:grid-cols-2 gap-3">
        <AdminField label={lb('questionType')}>
          <select
            value={form.question_type}
            onChange={(e) => set('question_type', e.target.value)}
            className={inputClass}
          >
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
            minHeight={100}
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
                  minHeight={72}
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
            minHeight={80}
            uploadFolder="questions"
            labels={editorLabels}
          />
        </AdminField>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
          {saving ? lb('saving') : editingId ? lb('update') : lb('save')}
        </button>
        {editingId ? (
          <button type="button" onClick={resetForm} className="text-sm px-4 py-2 border rounded-xl">
            {lb('cancelEdit')}
          </button>
        ) : null}
      </div>

      <div className="border-t border-violet-200/60 pt-3 space-y-2">
        <button
          type="button"
          onClick={() => setShowImport((v) => !v)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {lb('bulkImportTitle')} {showImport ? '▲' : '▼'}
        </button>
        {showImport ? (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">{lb('bulkImportHint')}</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
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
              <button
                type="button"
                onClick={() => downloadBulkImportTemplate(scopeType)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200"
              >
                {lb('downloadTemplate')}
              </button>
              <button
                type="button"
                onClick={() => importFileRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200"
              >
                {lb('chooseJsonFile')}
              </button>
              <input
                ref={importFileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => handleImportFile(e.target.files?.[0])}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={() => bulkStatus(IOAI_QUESTION_STATUS.LIVE)} className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800">
          {lb('bulkLive')}
        </button>
        <button type="button" onClick={() => bulkStatus(IOAI_QUESTION_STATUS.OFFLINE)} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700">
          {lb('bulkOffline')}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{lb('loading')}</p>
      ) : items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="p-2 w-8" />
                <th className="p-2">{lb('colSort')}</th>
                <th className="p-2">{lb('colType')}</th>
                <th className="p-2">{lb('colStem')}</th>
                <th className="p-2">{lb('colStatus')}</th>
                <th className="p-2">{lb('colScore')}</th>
                <th className="p-2 w-24">{lb('colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="p-2">
                    <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
                  </td>
                  <td className="p-2">{row.sort_order ?? i}</td>
                  <td className="p-2">{questionTypeLabel(row.question_type)}</td>
                  <td className="p-2 max-w-xs truncate">{stripHtmlUtil(row.stem_html)}</td>
                  <td className="p-2">{row.status}</td>
                  <td className="p-2">{row.score}</td>
                  <td className="p-2">
                    <button type="button" onClick={() => handleEdit(row)} className="text-primary mr-2">
                      {lb('edit')}
                    </button>
                    <button type="button" onClick={() => handleDelete(row.id)} className="text-red-600">
                      {lb('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500">{lb('empty')}</p>
      )}
    </div>
  )
}
