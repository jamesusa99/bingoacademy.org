/**
 * Deterministic IOAI readiness scoring.
 * Each question is 0 or 1. Earliest failed gate (correct < 3/5) decides the stage.
 */

import {
  IOAI_ASSESSMENT_GATE_PASS,
  IOAI_ASSESSMENT_GATE_SIZE,
  IOAI_DIMENSIONS,
  IOAI_GATES,
  IOAI_STAGES,
  recommendedBundleSlug,
  STAGE_WEAK_TAG_PRIORITY,
  WEAK_TAGS_WITHOUT_SKU,
} from '../config/ioaiAssessment.js'

function sameStringSet(a = [], b = []) {
  if (a.length !== b.length) return false
  const left = [...a].map(String).sort()
  const right = [...b].map(String).sort()
  return left.every((value, i) => value === right[i])
}

export function isQuestionCorrect(question, answer) {
  if (!question || !answer) return false
  const expected = question.correctAnswer
  if (!expected || expected.type !== question.questionType) return false

  if (question.questionType === 'single_choice' || question.questionType === 'true_false') {
    return Boolean(answer.optionId) && answer.optionId === expected.optionId
  }

  if (question.questionType === 'multiple_choice') {
    return sameStringSet(answer.optionIds || [], expected.optionIds || [])
  }

  if (question.questionType === 'matching') {
    const actual = answer.pairs || {}
    const wanted = expected.pairs || {}
    const keys = Object.keys(wanted)
    if (keys.length === 0) return false
    return keys.every((key) => actual[key] === wanted[key]) && Object.keys(actual).length === keys.length
  }

  return false
}

export function gateStatus(correct, total = IOAI_ASSESSMENT_GATE_SIZE) {
  if (correct >= IOAI_ASSESSMENT_GATE_PASS) {
    return correct === total ? 'passed' : 'developing'
  }
  return 'needs_work'
}

export function recommendStageFromGates(gateScores) {
  const g1 = gateScores.gate_1?.correct ?? 0
  const g2 = gateScores.gate_2?.correct ?? 0
  const g3 = gateScores.gate_3?.correct ?? 0
  if (g1 < IOAI_ASSESSMENT_GATE_PASS) return 'ai-explorer'
  if (g2 < IOAI_ASSESSMENT_GATE_PASS) return 'ai-builder'
  if (g3 < IOAI_ASSESSMENT_GATE_PASS) return 'ai-engineer'
  return 'ai-olympian'
}

export function earliestFailedGate(gateScores) {
  for (const gate of IOAI_GATES) {
    const correct = gateScores[gate.id]?.correct ?? 0
    if (correct < IOAI_ASSESSMENT_GATE_PASS) return gate.id
  }
  return null
}

export function collectWeakTags(questions, answersById) {
  const tags = []
  for (const question of questions) {
    if (isQuestionCorrect(question, answersById[question.id])) continue
    for (const tag of question.secondaryTags || []) {
      if (!tags.includes(tag)) tags.push(tag)
    }
  }
  return tags
}

export function isNonMonotonic(gateScores) {
  const g1 = gateScores.gate_1?.correct ?? 0
  const g2 = gateScores.gate_2?.correct ?? 0
  const g3 = gateScores.gate_3?.correct ?? 0
  return g2 < IOAI_ASSESSMENT_GATE_PASS && g3 >= IOAI_ASSESSMENT_GATE_PASS && g1 >= IOAI_ASSESSMENT_GATE_PASS
}

export function scoreIoaiAssessment(questions, answersById, { elapsedSeconds = 0 } = {}) {
  const gateScores = {
    gate_1: { correct: 0, total: IOAI_ASSESSMENT_GATE_SIZE },
    gate_2: { correct: 0, total: IOAI_ASSESSMENT_GATE_SIZE },
    gate_3: { correct: 0, total: IOAI_ASSESSMENT_GATE_SIZE },
  }

  const dimensionBuckets = {}
  for (const dim of IOAI_DIMENSIONS) {
    dimensionBuckets[dim.id] = { correct: 0, total: 0, percent: 0 }
  }

  let correctCount = 0
  const perQuestion = []

  for (const question of questions) {
    const correct = isQuestionCorrect(question, answersById[question.id])
    if (correct) correctCount += 1
    if (gateScores[question.gate]) {
      if (correct) gateScores[question.gate].correct += 1
    }
    if (dimensionBuckets[question.primaryDimension]) {
      dimensionBuckets[question.primaryDimension].total += 1
      if (correct) dimensionBuckets[question.primaryDimension].correct += 1
    }
    perQuestion.push({ id: question.id, correct })
  }

  for (const dim of IOAI_DIMENSIONS) {
    const bucket = dimensionBuckets[dim.id]
    bucket.percent = bucket.total ? Math.round((bucket.correct / bucket.total) * 100) : 0
  }

  const recommendedStage = recommendStageFromGates(gateScores)
  const weakTags = collectWeakTags(questions, answersById)
  const failedGate = earliestFailedGate(gateScores)

  return {
    correctCount,
    elapsedSeconds,
    gateScores,
    dimensionScores: dimensionBuckets,
    recommendedStage,
    recommendedStageName: IOAI_STAGES[recommendedStage]?.name,
    recommendedTitle: IOAI_STAGES[recommendedStage]?.title,
    recommendedBundleSlug: recommendedBundleSlug(recommendedStage),
    weakTags,
    skuSafeWeakTags: weakTags.filter((tag) => !WEAK_TAGS_WITHOUT_SKU.has(tag)),
    audioGap: weakTags.includes('audio'),
    failedGate,
    nonMonotonic: isNonMonotonic(gateScores),
    perQuestion,
    complete: questions.length > 0 && questions.every((q) => answersById[q.id] != null),
  }
}

export function prioritizedWeakTags(stageId, weakTags) {
  const order = STAGE_WEAK_TAG_PRIORITY[stageId] || []
  const ranked = order.filter((tag) => weakTags.includes(tag))
  const rest = weakTags.filter((tag) => !order.includes(tag) && !WEAK_TAGS_WITHOUT_SKU.has(tag))
  return [...ranked, ...rest]
}
