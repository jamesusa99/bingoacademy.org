#!/usr/bin/env node
/**
 * Seed IOAI curriculum tables from src/data/ioaiCurriculum.js
 *
 * Usage: npm run seed:ioai-curriculum
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'
import { ioaiCurriculum } from '../src/data/ioaiCurriculum.js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CATEGORY_LABEL = { math: '数学', python: 'Python', ai: 'AI' }

let levelOrder = 0
for (const level of ioaiCurriculum) {
  const { data: levelRow, error: levelErr } = await admin
    .from('course_levels')
    .upsert(
      {
        slug: level.id,
        title: level.title,
        emoji: level.emoji || null,
        sort_order: levelOrder++,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )
    .select('id, slug')
    .single()

  if (levelErr) {
    console.error('[seed] level', level.id, levelErr.message)
    process.exit(1)
  }

  let themeOrder = 0
  for (const theme of level.themes) {
    const { data: themeRow, error: themeErr } = await admin
      .from('themes')
      .upsert(
        {
          level_id: levelRow.id,
          slug: theme.id,
          title: theme.title,
          category_label: CATEGORY_LABEL[theme.id] || theme.title.replace(/主题$/, ''),
          sort_order: themeOrder++,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'level_id,slug' }
      )
      .select('id, slug')
      .single()

    if (themeErr) {
      console.error('[seed] theme', theme.id, themeErr.message)
      process.exit(1)
    }

    let modOrder = 0
    for (const mod of theme.modules) {
      const { data: modRow, error: modErr } = await admin
        .from('modules')
        .upsert(
          {
            theme_id: themeRow.id,
            slug: mod.id,
            title: mod.title,
            sort_order: modOrder++,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'theme_id,slug' }
        )
        .select('id, slug')
        .single()

      if (modErr) {
        console.error('[seed] module', mod.id, modErr.message)
        process.exit(1)
      }

      let lessonOrder = 0
      for (const lesson of mod.lessons) {
        const { error: lessonErr } = await admin.from('lessons').upsert(
          {
            module_id: modRow.id,
            slug: lesson.id,
            title: lesson.title,
            sort_order: lessonOrder++,
            catalog_slug: lesson.id,
            knowledge_points: `${theme.title} · ${mod.title} · ${lesson.title}`,
            content_goals: `掌握 ${mod.title} 中「${lesson.title}」的核心内容与练习目标。`,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        )
        if (lessonErr) {
          console.error('[seed] lesson', lesson.id, lessonErr.message)
          process.exit(1)
        }
      }
    }
  }
  console.log(`[seed] ✓ ${level.title}`)
}

const { count } = await admin.from('lessons').select('id', { count: 'exact', head: true })
console.log(`[seed] Done — ${count ?? '?'} lessons in database`)
