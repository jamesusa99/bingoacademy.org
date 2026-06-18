/** IOAI lesson exercises & module test question types */

export const IOAI_QUESTION_TYPES = {
  SINGLE: 'single_choice',
  MULTIPLE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
}

export const IOAI_QUESTION_STATUS = {
  DRAFT: 'draft',
  LIVE: 'live',
  OFFLINE: 'offline',
}

export const IOAI_OPTION_KEYS = ['A', 'B', 'C', 'D']

export const IOAI_TRUE_FALSE_OPTIONS = [
  { key: 'A', label: '正确' },
  { key: 'B', label: '错误' },
]

export function questionTypeLabel(type) {
  if (type === IOAI_QUESTION_TYPES.SINGLE) return '单选题'
  if (type === IOAI_QUESTION_TYPES.MULTIPLE) return '多选题'
  if (type === IOAI_QUESTION_TYPES.TRUE_FALSE) return '判断题'
  return type
}

export function emptyQuestionForm(scopeType = 'lesson') {
  return {
    scope_type: scopeType,
    question_type: IOAI_QUESTION_TYPES.SINGLE,
    stem_html: '',
    option_a_html: '',
    option_b_html: '',
    option_c_html: '',
    option_d_html: '',
    correct_single: 'A',
    correct_multiple: [],
    correct_true_false: 'A',
    explanation_html: '',
    score: 1,
    sort_order: 0,
    status: IOAI_QUESTION_STATUS.DRAFT,
  }
}

/** Validate admin payload before save */
export function validateIoaiQuestionPayload(form) {
  const errors = []
  if (!String(form.stem_html || '').trim()) errors.push('题干为必填')

  const type = form.question_type
  if (type === IOAI_QUESTION_TYPES.SINGLE) {
    const key = form.correct_single
    if (!IOAI_OPTION_KEYS.includes(key)) errors.push('请选择单选题正确答案')
    for (const k of IOAI_OPTION_KEYS) {
      const field = `option_${k.toLowerCase()}_html`
      if (!String(form[field] || '').trim()) errors.push(`选项 ${k} 为必填`)
    }
  } else if (type === IOAI_QUESTION_TYPES.MULTIPLE) {
    const keys = Array.isArray(form.correct_multiple) ? form.correct_multiple : []
    if (keys.length < 2) errors.push('多选题至少需要 2 个正确答案')
    for (const k of IOAI_OPTION_KEYS) {
      const field = `option_${k.toLowerCase()}_html`
      if (!String(form[field] || '').trim()) errors.push(`选项 ${k} 为必填`)
    }
  } else if (type === IOAI_QUESTION_TYPES.TRUE_FALSE) {
    if (!['A', 'B'].includes(form.correct_true_false)) errors.push('请选择判断题正确答案')
  } else {
    errors.push('未知题型')
  }

  return errors
}

export function formToQuestionRow(form, scopeType, scopeId) {
  const type = form.question_type
  let correct_answer
  if (type === IOAI_QUESTION_TYPES.SINGLE) {
    correct_answer = form.correct_single
  } else if (type === IOAI_QUESTION_TYPES.MULTIPLE) {
    correct_answer = [...(form.correct_multiple || [])].sort()
  } else {
    correct_answer = form.correct_true_false
  }

  return {
    scope_type: scopeType,
    scope_id: scopeId,
    question_type: type,
    stem_html: String(form.stem_html || '').trim(),
    option_a_html: type === IOAI_QUESTION_TYPES.TRUE_FALSE ? null : String(form.option_a_html || '').trim(),
    option_b_html: type === IOAI_QUESTION_TYPES.TRUE_FALSE ? null : String(form.option_b_html || '').trim(),
    option_c_html: type === IOAI_QUESTION_TYPES.TRUE_FALSE ? null : String(form.option_c_html || '').trim(),
    option_d_html: type === IOAI_QUESTION_TYPES.TRUE_FALSE ? null : String(form.option_d_html || '').trim(),
    correct_answer,
    explanation_html: String(form.explanation_html || '').trim(),
    score: Math.max(0, parseInt(form.score, 10) || 1),
    sort_order: parseInt(form.sort_order, 10) || 0,
    status: form.status || IOAI_QUESTION_STATUS.DRAFT,
    updated_at: new Date().toISOString(),
  }
}

export function rowToQuestionForm(row) {
  const correct = row.correct_answer
  return {
    question_type: row.question_type,
    stem_html: row.stem_html || '',
    option_a_html: row.option_a_html || '',
    option_b_html: row.option_b_html || '',
    option_c_html: row.option_c_html || '',
    option_d_html: row.option_d_html || '',
    correct_single: row.question_type === IOAI_QUESTION_TYPES.SINGLE ? correct : 'A',
    correct_multiple: row.question_type === IOAI_QUESTION_TYPES.MULTIPLE && Array.isArray(correct) ? correct : [],
    correct_true_false: row.question_type === IOAI_QUESTION_TYPES.TRUE_FALSE ? correct : 'A',
    explanation_html: row.explanation_html || '',
    score: row.score ?? 1,
    sort_order: row.sort_order ?? 0,
    status: row.status || IOAI_QUESTION_STATUS.DRAFT,
  }
}

/** Format correct answer for admin list / answer sheet */
export function formatCorrectAnswer(row, { trueLabel = '正确', falseLabel = '错误' } = {}) {
  const c = row.correct_answer
  if (row.question_type === IOAI_QUESTION_TYPES.TRUE_FALSE) {
    return c === 'A' ? `A · ${trueLabel}` : `B · ${falseLabel}`
  }
  if (Array.isArray(c)) return c.join(', ')
  return String(c || '—')
}

export function questionBankStats(items) {
  const live = items.filter((i) => i.status === IOAI_QUESTION_STATUS.LIVE).length
  const draft = items.filter((i) => i.status === IOAI_QUESTION_STATUS.DRAFT).length
  const offline = items.filter((i) => i.status === IOAI_QUESTION_STATUS.OFFLINE).length
  const liveScore = items
    .filter((i) => i.status === IOAI_QUESTION_STATUS.LIVE)
    .reduce((sum, i) => sum + (i.score ?? 1), 0)
  return { live, draft, offline, total: items.length, liveScore }
}

export function formToPreviewQuestion(form, id = 'draft-preview') {
  const row = {
    id,
    question_type: form.question_type,
    stem_html: form.stem_html,
    option_a_html: form.option_a_html,
    option_b_html: form.option_b_html,
    option_c_html: form.option_c_html,
    option_d_html: form.option_d_html,
    score: form.score ?? 1,
    sort_order: form.sort_order ?? 0,
  }
  return sanitizeQuestionForClient(row)
}

export function previewCorrectAnswer(form) {
  const type = form.question_type
  if (type === IOAI_QUESTION_TYPES.SINGLE) return form.correct_single
  if (type === IOAI_QUESTION_TYPES.MULTIPLE) return [...(form.correct_multiple || [])].sort()
  return form.correct_true_false
}

/** Strip correct answers for client-facing fetch */
export function sanitizeQuestionForClient(row) {
  return {
    id: row.id,
    questionType: row.question_type,
    stemHtml: row.stem_html,
    options:
      row.question_type === IOAI_QUESTION_TYPES.TRUE_FALSE
        ? IOAI_TRUE_FALSE_OPTIONS.map((o) => ({ key: o.key, html: o.label }))
        : IOAI_OPTION_KEYS.map((key) => ({
            key,
            html: row[`option_${key.toLowerCase()}_html`] || '',
          })),
    score: row.score ?? 1,
    sortOrder: row.sort_order ?? 0,
  }
}

/** Grade one answer; returns { correct, earnedScore, correctAnswer, explanationHtml } */
export function gradeIoaiQuestion(row, userAnswer) {
  const type = row.question_type
  const maxScore = row.score ?? 1
  let correct = false

  if (type === IOAI_QUESTION_TYPES.SINGLE || type === IOAI_QUESTION_TYPES.TRUE_FALSE) {
    correct = String(userAnswer).toUpperCase() === String(row.correct_answer).toUpperCase()
  } else if (type === IOAI_QUESTION_TYPES.MULTIPLE) {
    const expected = [...(Array.isArray(row.correct_answer) ? row.correct_answer : [])].sort().join(',')
    const given = [...(Array.isArray(userAnswer) ? userAnswer : [])].sort().join(',')
    correct = expected === given && expected.length > 0
  }

  return {
    correct,
    earnedScore: correct ? maxScore : 0,
    correctAnswer: row.correct_answer,
    explanationHtml: row.explanation_html || '',
  }
}

function wrapPlainText(html) {
  const text = String(html || '').trim()
  if (!text) return ''
  if (/<[a-z][\s\S]*>/i.test(text)) return text
  return `<p>${text.replace(/\n/g, '<br/>')}</p>`
}

/** Normalize one bulk-import row to admin form shape */
export function normalizeBulkImportItem(raw, index = 0) {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`第 ${index + 1} 题：无效对象`)
  }

  const type = raw.question_type || raw.questionType || IOAI_QUESTION_TYPES.SINGLE
  const options = raw.options && typeof raw.options === 'object' ? raw.options : {}

  const form = {
    ...emptyQuestionForm(raw.scope_type || 'lesson'),
    question_type: type,
    stem_html: wrapPlainText(raw.stem_html ?? raw.stem ?? ''),
    option_a_html: wrapPlainText(raw.option_a_html ?? options.A ?? raw.optionA ?? ''),
    option_b_html: wrapPlainText(raw.option_b_html ?? options.B ?? raw.optionB ?? ''),
    option_c_html: wrapPlainText(raw.option_c_html ?? options.C ?? raw.optionC ?? ''),
    option_d_html: wrapPlainText(raw.option_d_html ?? options.D ?? raw.optionD ?? ''),
    explanation_html: wrapPlainText(raw.explanation_html ?? raw.explanation ?? ''),
    score: raw.score ?? 1,
    sort_order: raw.sort_order ?? raw.sortOrder ?? index,
    status: raw.status || IOAI_QUESTION_STATUS.DRAFT,
  }

  const answer = raw.correct_answer ?? raw.correctAnswer ?? raw.answer
  if (type === IOAI_QUESTION_TYPES.SINGLE) {
    form.correct_single = String(raw.correct_single ?? answer ?? 'A').toUpperCase()
  } else if (type === IOAI_QUESTION_TYPES.MULTIPLE) {
    const multi = raw.correct_multiple ?? answer
    form.correct_multiple = Array.isArray(multi)
      ? multi.map((k) => String(k).toUpperCase())
      : String(multi || '')
          .split(/[,，\s]+/)
          .filter(Boolean)
          .map((k) => k.toUpperCase())
  } else {
    form.correct_true_false = String(raw.correct_true_false ?? answer ?? 'A').toUpperCase()
  }

  return form
}

/** Parse JSON array for bulk import; returns validated form objects */
export function parseBulkImportJson(text) {
  let data
  try {
    data = JSON.parse(String(text || '').trim())
  } catch {
    throw new Error('JSON 格式无效')
  }
  if (!Array.isArray(data)) throw new Error('批量导入必须是 JSON 数组')
  if (!data.length) throw new Error('导入数组不能为空')

  const forms = []
  const errors = []
  data.forEach((row, i) => {
    try {
      const form = normalizeBulkImportItem(row, i)
      const rowErrors = validateIoaiQuestionPayload(form)
      if (rowErrors.length) errors.push(`第 ${i + 1} 题：${rowErrors.join('；')}`)
      else forms.push(form)
    } catch (e) {
      errors.push(e.message || `第 ${i + 1} 题无效`)
    }
  })

  if (errors.length) throw new Error(errors.join('\n'))
  return forms
}

export function bulkImportTemplate(scopeType = 'lesson') {
  return [
    {
      question_type: 'single_choice',
      stem: 'Python 中打印输出的函数是？',
      options: { A: 'print()', B: 'echo()', C: 'printf()', D: 'output()' },
      correct_answer: 'A',
      explanation: 'Python 使用 print() 输出内容。',
      score: 1,
      sort_order: 0,
      status: 'draft',
    },
    {
      question_type: 'multiple_choice',
      stem: '以下哪些是 Python 基本数据类型？（多选）',
      options: { A: 'int', B: 'list', C: 'char', D: 'dict' },
      correct_answer: ['A', 'B', 'D'],
      explanation: 'Python 没有 char 类型。',
      score: 2,
      sort_order: 1,
      status: 'draft',
    },
    {
      question_type: 'true_false',
      stem: 'Python 是一种编译型语言。',
      correct_answer: 'B',
      explanation: 'Python 是解释型语言。',
      score: 1,
      sort_order: 2,
      status: 'draft',
    },
  ]
}

export function downloadBulkImportTemplate(scopeType = 'lesson') {
  const blob = new Blob([JSON.stringify(bulkImportTemplate(scopeType), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ioai-questions-${scopeType}-template.json`
  a.click()
  URL.revokeObjectURL(url)
}
