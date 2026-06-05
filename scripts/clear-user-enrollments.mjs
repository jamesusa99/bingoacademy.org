#!/usr/bin/env node
/**
 * Clear course enrollments for one user (by email) or all users.
 *
 * Usage:
 *   node scripts/clear-user-enrollments.mjs --email you@example.com
 *   node scripts/clear-user-enrollments.mjs --all
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import '../server/lib/loadEnv.mjs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const args = process.argv.slice(2)
const emailArg = args.find((a) => a.startsWith('--email='))?.split('=')[1]
  ?? (args.indexOf('--email') >= 0 ? args[args.indexOf('--email') + 1] : null)
const allUsers = args.includes('--all')

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function clearForUser(userId) {
  const { count: enrollments } = await admin
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: access } = await admin
    .from('user_course_access')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  await admin.from('course_enrollments').delete().eq('user_id', userId)
  await admin.from('user_course_access').delete().eq('user_id', userId)

  return { enrollments: enrollments ?? 0, access: access ?? 0 }
}

async function main() {
  if (!emailArg && !allUsers) {
    console.error('Pass --email user@example.com or --all')
    process.exit(1)
  }

  if (allUsers) {
    const { count } = await admin
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
    await admin.from('course_enrollments').delete().not('user_id', 'is', null)
    await admin.from('user_course_access').delete().not('user_id', 'is', null)
    console.log(`[ok] Cleared all enrollments (${count ?? 0} row(s)) and user_course_access`)
    return
  }

  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw listErr

  const user = list.users.find((u) => u.email?.toLowerCase() === emailArg.toLowerCase())
  if (!user) {
    console.error(`No auth user found for ${emailArg}`)
    process.exit(1)
  }

  const removed = await clearForUser(user.id)
  console.log(`[ok] ${emailArg} (${user.id})`)
  console.log(`     course_enrollments: ${removed.enrollments}`)
  console.log(`     user_course_access: ${removed.access}`)
  console.log('\nAlso clear browser storage: Profile → Account settings → Clear all course purchases')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
