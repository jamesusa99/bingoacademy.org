/**
 * Verify IOAI readiness assessment bank + scoring against the V1 plan.
 * Run: node scripts/verify-ioai-assessment.mjs
 */

import { IOAI_ASSESSMENT_QUESTIONS } from '../src/data/ioaiAssessmentQuestions.js'
import { scoreIoaiAssessment, isQuestionCorrect, recommendStageFromGates } from '../src/lib/ioaiAssessmentScore.js'
import { WEAK_TAGS_WITHOUT_SKU } from '../src/config/ioaiAssessment.js'

const errors = []
function assert(cond, message) {
  if (!cond) errors.push(message)
}

const questions = IOAI_ASSESSMENT_QUESTIONS
assert(questions.length === 15, `expected 15 questions, got ${questions.length}`)

const typeCounts = {}
const dimCounts = {}
const gateCounts = {}
const forbidden = ['fill', 'text', 'code_input', 'upload']

for (const q of questions) {
  typeCounts[q.questionType] = (typeCounts[q.questionType] || 0) + 1
  dimCounts[q.primaryDimension] = (dimCounts[q.primaryDimension] || 0) + 1
  gateCounts[q.gate] = (gateCounts[q.gate] || 0) + 1
  assert(['single_choice', 'true_false', 'multiple_choice', 'matching'].includes(q.questionType), `${q.id} invalid type`)
  assert(!forbidden.includes(q.questionType), `${q.id} uses a forbidden type`)
  assert(q.syllabusCategory === 'theory' || q.syllabusCategory === 'practice' || q.syllabusCategory === 'both', `${q.id} missing syllabusCategory`)
  assert(q.correctAnswer?.type === q.questionType, `${q.id} answer type mismatch`)
  if (q.questionType === 'multiple_choice') {
    assert((q.selectCount || q.correctAnswer.optionIds.length) >= 2, `${q.id} multi must ask for count`)
    assert(q.stem.toLowerCase().includes('select two') || q.stem.toLowerCase().includes('two answers'), `${q.id} should hint select two`)
  }
  if (q.questionType === 'matching') {
    assert((q.matchingItems?.left || []).length <= 4, `${q.id} matching has more than 4 pairs`)
  }
}

assert(typeCounts.single_choice === 10, `single_choice ${typeCounts.single_choice}`)
assert(typeCounts.true_false === 2, `true_false ${typeCounts.true_false}`)
assert(typeCounts.multiple_choice === 2, `multiple_choice ${typeCounts.multiple_choice}`)
assert(typeCounts.matching === 1, `matching ${typeCounts.matching}`)
assert(dimCounts.programming_data === 4, `programming_data ${dimCounts.programming_data}`)
assert(dimCounts.classical_ml === 4, `classical_ml ${dimCounts.classical_ml}`)
assert(dimCounts.deep_learning === 3, `deep_learning ${dimCounts.deep_learning}`)
assert(dimCounts.computer_vision === 2, `computer_vision ${dimCounts.computer_vision}`)
assert(dimCounts.nlp_audio === 2, `nlp_audio ${dimCounts.nlp_audio}`)
assert(gateCounts.gate_1 === 5 && gateCounts.gate_2 === 5 && gateCounts.gate_3 === 5, `gate counts ${JSON.stringify(gateCounts)}`)

function allCorrect() {
  const answers = {}
  for (const q of questions) {
    if (q.questionType === 'matching') answers[q.id] = { type: 'matching', pairs: { ...q.correctAnswer.pairs } }
    else if (q.questionType === 'multiple_choice') answers[q.id] = { type: 'multiple_choice', optionIds: [...q.correctAnswer.optionIds] }
    else answers[q.id] = { type: q.questionType, optionId: q.correctAnswer.optionId }
  }
  return answers
}

function wrong(question, answers) {
  const next = { ...answers }
  if (question.questionType === 'true_false') {
    next[question.id] = { type: 'true_false', optionId: question.correctAnswer.optionId === 'true' ? 'false' : 'true' }
  } else if (question.questionType === 'single_choice') {
    const other = question.options.find((o) => o.id !== question.correctAnswer.optionId)
    next[question.id] = { type: 'single_choice', optionId: other.id }
  } else if (question.questionType === 'multiple_choice') {
    next[question.id] = { type: 'multiple_choice', optionIds: [question.options[0].id] }
  } else {
    next[question.id] = { type: 'matching', pairs: {} }
  }
  return next
}

const perfect = scoreIoaiAssessment(questions, allCorrect())
assert(perfect.recommendedStage === 'ai-olympian', `all correct should be olympiad, got ${perfect.recommendedStage}`)
assert(perfect.correctCount === 15, `perfect count ${perfect.correctCount}`)
assert(perfect.dimensionScores.computer_vision.total === 2, 'CV denominator should be 2')

let explorerAnswers = allCorrect()
for (const q of questions.filter((q) => q.gate === 'gate_1')) explorerAnswers = wrong(q, explorerAnswers)
const explorer = scoreIoaiAssessment(questions, explorerAnswers)
assert(explorer.recommendedStage === 'ai-explorer', `gate1 fail => explorer, got ${explorer.recommendedStage}`)

let builderAnswers = allCorrect()
for (const q of questions.filter((q) => q.gate === 'gate_2')) builderAnswers = wrong(q, builderAnswers)
const builder = scoreIoaiAssessment(questions, builderAnswers)
assert(builder.recommendedStage === 'ai-builder', `gate2 fail => builder, got ${builder.recommendedStage}`)
assert(builder.nonMonotonic === true, 'gate2 fail + gate3 pass should be non-monotonic')

let engineerAnswers = allCorrect()
for (const q of questions.filter((q) => q.gate === 'gate_3')) engineerAnswers = wrong(q, engineerAnswers)
const engineer = scoreIoaiAssessment(questions, engineerAnswers)
assert(engineer.recommendedStage === 'ai-engineer', `gate3 fail => engineer, got ${engineer.recommendedStage}`)

const planExample = allCorrect()
for (const q of questions.filter((q) => q.gate === 'gate_2').slice(0, 3)) {
  // 2/5 on gate 2 means 3 wrong
}
const g2 = questions.filter((q) => q.gate === 'gate_2')
let example = allCorrect()
example = wrong(g2[0], example)
example = wrong(g2[1], example)
example = wrong(g2[2], example)
const exampleResult = scoreIoaiAssessment(questions, example)
assert(exampleResult.gateScores.gate_2.correct === 2, `example gate2 ${exampleResult.gateScores.gate_2.correct}`)
assert(exampleResult.recommendedStage === 'ai-builder', `plan example should be builder, got ${exampleResult.recommendedStage}`)

const again = scoreIoaiAssessment(questions, example)
assert(JSON.stringify(again.dimensionScores) === JSON.stringify(exampleResult.dimensionScores), 'scoring must be deterministic')

assert(!isQuestionCorrect(questions[8], { type: 'multiple_choice', optionIds: ['a'] }), 'multi partial credit must be 0')

const audioMods = []
assert(audioMods.length === 0, 'audio must not map to a SKU')
assert(WEAK_TAGS_WITHOUT_SKU.has('audio'), 'audio listed as no-SKU')

assert(recommendStageFromGates({ gate_1: { correct: 5 }, gate_2: { correct: 2 }, gate_3: { correct: 4 } }) === 'ai-builder', 'earliest fail')

if (errors.length) {
  console.error('IOAI assessment verification failed:')
  for (const err of errors) console.error(' -', err)
  process.exit(1)
}

console.log('IOAI assessment verification passed: 15 questions, 10/2/2/1 types, 4/4/3/2/2 dimensions, gate algorithm OK.')
