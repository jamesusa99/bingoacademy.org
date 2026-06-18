import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  emptyQuestionForm,
  formToQuestionRow,
  parseBulkImportJson,
  questionBankStats,
  rowToQuestionForm,
  validateIoaiQuestionPayload,
} from '../config/ioaiQuestions'
import {
  bulkImportQuestions,
  bulkUpdateQuestionStatus,
  deleteQuestion,
  fetchQuestionsForScope,
  saveQuestion,
} from '../lib/ioaiQuestionsAdmin'

export function useIoaiQuestionBank({ scopeType, scopeId, enabled = true, onUpdated }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [form, setForm] = useState(() => emptyQuestionForm(scopeType))
  const [selected, setSelected] = useState(() => new Set())

  const stats = useMemo(() => questionBankStats(items), [items])
  const activeRow = useMemo(() => items.find((r) => r.id === activeId) || null, [items, activeId])
  const isNew = activeId === '__new__'
  const activeIndex = useMemo(() => {
    if (!activeId || isNew) return -1
    return items.findIndex((r) => r.id === activeId)
  }, [activeId, isNew, items])

  const reload = useCallback(async () => {
    if (!scopeId || !enabled) {
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
      onUpdated?.(rows)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [scopeType, scopeId, enabled, onUpdated])

  useEffect(() => {
    reload()
  }, [reload])

  const startNew = useCallback(() => {
    setActiveId('__new__')
    setForm(emptyQuestionForm(scopeType))
  }, [scopeType])

  const selectRow = useCallback((row) => {
    setActiveId(row.id)
    setForm(rowToQuestionForm(row))
  }, [])

  const resetSelection = useCallback(() => {
    setActiveId(null)
    setForm(emptyQuestionForm(scopeType))
  }, [scopeType])

  const persistForm = useCallback(
    async (statusOverride) => {
      const payloadForm = statusOverride ? { ...form, status: statusOverride } : form
      const errors = validateIoaiQuestionPayload(payloadForm)
      if (errors.length) {
        setError(errors.join('；'))
        return false
      }
      setSaving(true)
      setError(null)
      setSuccess(null)
      try {
        const payload = formToQuestionRow(payloadForm, scopeType, scopeId)
        const savedId = await saveQuestion(isNew ? null : activeId, payload)
        await reload()
        if (savedId) setActiveId(savedId)
        if (statusOverride) setForm((f) => ({ ...f, status: statusOverride }))
        return true
      } catch (e) {
        setError(e.message)
        return false
      } finally {
        setSaving(false)
      }
    },
    [form, scopeType, scopeId, isNew, activeId, reload]
  )

  const handleDelete = useCallback(
    async (id) => {
      await deleteQuestion(id)
      if (activeId === id) resetSelection()
      await reload()
    },
    [activeId, resetSelection, reload]
  )

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const bulkStatus = useCallback(
    async (status) => {
      if (!selected.size) return
      await bulkUpdateQuestionStatus([...selected], status)
      setSelected(new Set())
      await reload()
    },
    [selected, reload]
  )

  const handleImport = useCallback(
    async (importText) => {
      setImporting(true)
      setError(null)
      try {
        const forms = parseBulkImportJson(importText)
        const ids = await bulkImportQuestions(scopeType, scopeId, forms)
        await reload()
        setSuccess(String(ids.length))
        return ids.length
      } catch (e) {
        setError(e.message)
        throw e
      } finally {
        setImporting(false)
      }
    },
    [scopeType, scopeId, reload]
  )

  const goPrev = useCallback(() => {
    if (activeIndex > 0) selectRow(items[activeIndex - 1])
  }, [activeIndex, items, selectRow])

  const goNext = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < items.length - 1) selectRow(items[activeIndex + 1])
  }, [activeIndex, items, selectRow])

  const set = useCallback((key, value) => setForm((f) => ({ ...f, [key]: value })), [])

  return {
    items,
    loading,
    saving,
    importing,
    error,
    success,
    setError,
    setSuccess,
    setSuccess,
    stats,
    activeId,
    activeRow,
    activeIndex,
    isNew,
    form,
    set,
    selected,
    startNew,
    selectRow,
    resetSelection,
    persistForm,
    handleDelete,
    toggleSelect,
    bulkStatus,
    handleImport,
    goPrev,
    goNext,
    reload,
  }
}
