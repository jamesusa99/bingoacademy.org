#!/usr/bin/env node
/**
 * Replace community forum threads with curated IOAI news.
 *
 * Usage:
 *   npm run seed:forum-ioai
 *   npm run seed:forum-ioai -- --force
 *
 * Requires in .env.local:
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'
import { IOAI_FORUM_THREADS } from '../src/config/seed/ioaiForumNews.js'

const force = process.argv.includes('--force')
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function tableCount(table) {
  const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true })
  if (error) throw new Error(`${table} count: ${error.message}`)
  return count ?? 0
}

async function clearTable(table) {
  const { error } = await admin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(`clear ${table}: ${error.message}`)
}

async function syncIoaiForumNews() {
  const existing = await tableCount('forum_threads')
  if (existing > 0 && !force) {
    console.log(`[forum-ioai] Skipped — ${existing} thread(s) already in forum_threads. Use --force to replace.`)
    return { skipped: true, existing }
  }

  if (existing > 0) {
    console.log('[forum-ioai] Clearing existing forum replies and threads…')
    await clearTable('forum_replies')
    await clearTable('forum_threads')
  }

  let replyCount = 0
  for (const thread of IOAI_FORUM_THREADS) {
    const ts = thread.publishedAt
    const { data: inserted, error } = await admin
      .from('forum_threads')
      .insert({
        title: thread.title,
        content: thread.content,
        author: thread.author,
        avatar: thread.avatar,
        category: thread.category,
        image: thread.image ?? null,
        created_at: ts,
        updated_at: ts,
      })
      .select('id')
      .single()

    if (error) throw new Error(`forum_threads insert: ${error.message}`)

    if (thread.replies?.length) {
      const rows = thread.replies.map((reply, i) => ({
        thread_id: inserted.id,
        content: reply.content,
        author: reply.author,
        avatar: reply.avatar,
        created_at: reply.publishedAt ?? new Date(new Date(ts).getTime() + (i + 1) * 3600000).toISOString(),
      }))
      const { error: replyError } = await admin.from('forum_replies').insert(rows)
      if (replyError) throw new Error(`forum_replies insert: ${replyError.message}`)
      replyCount += rows.length
    }
  }

  const summary = { threads: IOAI_FORUM_THREADS.length, replies: replyCount, force }
  console.log('[forum-ioai] Synced IOAI news to forum:', summary)
  return summary
}

try {
  const result = await syncIoaiForumNews()
  console.log(JSON.stringify(result, null, 2))
} catch (err) {
  console.error('[forum-ioai] Failed:', err.message)
  process.exit(1)
}
