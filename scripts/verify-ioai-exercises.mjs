#!/usr/bin/env node
/**
 * Verify IOAI lesson exercise API + grading for a lesson catalog slug.
 * Usage: node scripts/verify-ioai-exercises.mjs [lessonRef]
 * Requires: npm run dev (API on 8787) and migration 031 applied.
 */
import { gradeIoaiQuestion, IOAI_QUESTION_STATUS, IOAI_QUESTION_TYPES } from '../src/config/ioaiQuestions.js'

const API = process.env.API_BASE || 'http://127.0.0.1:8787'
const lessonRef =
  process.argv[2] ||
  'ioai-ai-explorer-pythoncoding-studio-python-creator-quest-c1'

async function fetchJson(path) {
  const res = await fetch(`${API}${path}`)
  const body = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, body }
}

function logSection(title) {
  console.log(`\n=== ${title} ===`)
}

async function main() {
  logSection(`Lesson exercises: ${lessonRef}`)

  const { ok, status, body } = await fetchJson(
    `/api/ioai/lessons/${encodeURIComponent(lessonRef)}/exercises`
  )

  if (!ok && status !== 200) {
    console.error(`API error ${status}:`, body.error || body)
    console.error('Ensure npm run dev is running and Supabase is configured.')
    process.exit(1)
  }

  console.log('count:', body.count)
  console.log('questions:', body.questions?.length ?? 0)

  if (!body.count) {
    console.warn(
      'No live exercises for this lesson. Add questions in Admin → IOAI Curriculum → edit lesson → 随堂习题, set status to 启用.'
    )
  } else {
    for (const q of body.questions || []) {
      console.log(`- [${q.questionType}] id=${q.id} score=${q.score}`)
      console.log(`  stem: ${String(q.stemHtml).replace(/<[^>]+>/g, '').slice(0, 80)}…`)
    }
  }

  logSection('Grading logic (unit test)')
  const sampleRow = {
    question_type: IOAI_QUESTION_TYPES.SINGLE,
    correct_answer: 'A',
    score: 1,
    explanation_html: '<p>Because A</p>',
  }
  const correct = gradeIoaiQuestion(sampleRow, 'A')
  const wrong = gradeIoaiQuestion(sampleRow, 'B')
  console.log('single A→A:', correct.correct, 'earned', correct.earnedScore)
  console.log('single A→B:', wrong.correct, 'earned', wrong.earnedScore)

  const multiRow = {
    question_type: IOAI_QUESTION_TYPES.MULTIPLE,
    correct_answer: ['A', 'C'],
    score: 2,
    explanation_html: '',
  }
  console.log('multi exact:', gradeIoaiQuestion(multiRow, ['A', 'C']).correct)
  console.log('multi partial:', gradeIoaiQuestion(multiRow, ['A']).correct)
  console.log('multi extra:', gradeIoaiQuestion(multiRow, ['A', 'B', 'C']).correct)

  logSection('Grade API (expect 403 without purchase)')
  if (body.questions?.[0]?.id) {
    const gradeRes = await fetch(
      `${API}/api/ioai/lessons/${encodeURIComponent(lessonRef)}/exercises/grade`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: body.questions[0].id, answer: 'A' }),
      }
    )
    const gradeBody = await gradeRes.json().catch(() => ({}))
    console.log('grade status:', gradeRes.status, gradeBody.error || gradeBody.correct || gradeBody)
  }

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
