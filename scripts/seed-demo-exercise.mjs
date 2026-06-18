#!/usr/bin/env node
/**
 * Seed one live demo exercise for a lesson (for flow verification).
 * Usage: node scripts/seed-demo-exercise.mjs [lessonCatalogSlug]
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolveLessonDbId } from '../server/lib/ioaiQuestions.mjs'

dotenv.config({ path: '.env.local' })
dotenv.config()

const lessonRef =
  process.argv[2] ||
  'ioai-ai-explorer-pythoncoding-studio-python-creator-quest-c1'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false } })

async function main() {
  const lessonDbId = await resolveLessonDbId(admin, lessonRef)
  if (!lessonDbId) {
    console.error('Lesson not found:', lessonRef)
    process.exit(1)
  }

  const { data: existing } = await admin
    .from('ioai_question_items')
    .select('id')
    .eq('scope_type', 'lesson')
    .eq('scope_id', lessonDbId)
    .eq('status', 'live')
    .limit(1)

  if (existing?.length) {
    console.log('Live exercise already exists for lesson', lessonRef)
    return
  }

  const row = {
    scope_type: 'lesson',
    scope_id: lessonDbId,
    question_type: 'single_choice',
    stem_html: '<p>Python 中用于输出内容的函数是？</p>',
    option_a_html: '<p><code>print()</code></p>',
    option_b_html: '<p><code>echo()</code></p>',
    option_c_html: '<p><code>output()</code></p>',
    option_d_html: '<p><code>write()</code></p>',
    correct_answer: 'A',
    explanation_html: '<p>Python 使用内置函数 <strong>print()</strong> 向控制台输出。</p>',
    score: 1,
    sort_order: 0,
    status: 'live',
  }

  const { data, error } = await admin.from('ioai_question_items').insert(row).select('id').single()
  if (error) {
    console.error('Insert failed:', error.message)
    if (error.message.includes('ioai_question_items')) {
      console.error('Run migration 031_ioai_question_bank.sql in Supabase first.')
    }
    process.exit(1)
  }

  console.log('Seeded demo exercise', data.id, 'for', lessonRef)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
