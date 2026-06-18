import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const onUpdatedRef = useRef(onUpdated)
  onUpdatedRef.current = onUpdated

  const stats = useMemo(() => questionBankStats(items), [items])
  const activeRow = useMemo(() => items.find((r) => r.id === activeId) || null, [items, activeId])
  const isNew = activeId === '__new__'
  const activeIndex = useMemo(() => {
    if (!activeId || isNew) return -1
    return items.findIndex((r) => r.id === activeId)
  }, [activeId, isNew, items])

  const loadItems = useCallback(
    async ({ silent = false, keepMessages = false } = {}) => {
      if (!scopeId || !enabled) {
        setItems([])
        if (!silent) setLoading(false)
        return []
      }
      if (!silent) setLoading(true)
      try {
        const rows = await fetchQuestionsForScope(scopeType, scopeId)
        setItems(rows)
        if (!keepMessages) {
          setError(null)
          setSuccess(null)
        }
        onUpdatedRef.current?.(rows)
        return rows
      } catch (e) {
        setError(e.message || 'Failed to load questions')
        return []
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [scopeType, scopeId, enabled]
  )

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const startNew = useCallback(() => {
    setActiveId('__new__')
    setForm(emptyQuestionForm(scopeType))
    setError(null)
    setSuccess(null)
  }, [scopeType])

  const selectRow = useCallback((row) => {
    setActiveId(row.id)
    setForm(rowToQuestionForm(row))
    setError(null)
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
        const rows = await loadItems({ silent: true, keepMessages: true })
        const savedRow = rows.find((r) => r.id === savedId)
        if (savedId) {
          setActiveId(savedId)
          if (savedRow) setForm(rowToQuestionForm(savedRow))
          else if (statusOverride) setForm((f) => ({ ...f, status: statusOverride }))
        }
        return Boolean(savedId)
      } catch (e) {
        setError(e.message || 'Failed to save question')
        return false
      } finally {
        setSaving(false)
      }
    },
    [form, scopeType, scopeId, isNew, activeId, loadItems]
  )

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteQuestion(id)
        if (activeId === id) resetSelection()
        await loadItems({ silent: true })
      } catch (e) {
        setError(e.message || 'Failed to delete question')
      }
    },
    [activeId, resetSelection, loadItems]
  )

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkStatus = useCallback(
    async (status) => {
      if (!selected.size) return
      try {
        await bulkUpdateQuestionStatus([...selected], status)
        setSelected(new Set())
        await loadItems({ silent: true })
      } catch (e) {
        setError(e.message || 'Failed to update status')
      }
    },
    [selected, loadItems]
  )

  const handleImport = useCallback(
    async (importText) => {
      setImporting(true)
      setError(null)
      try {
        const forms = parseBulkImportJson(importText)
        const ids = await bulkImportQuestions(scopeType, scopeId, forms)
        await loadItems({ silent: true })
        setSuccess(String(ids.length))
        return ids.length
      } catch (e) {
        setError(e.message || 'Import failed')
        throw e
      } finally {
        setImporting(false)
      }
    },
    [scopeType, scopeId, loadItems]
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
    reload: loadItems,
  }
}
