/**
 * Import frontend static / fallback data into Supabase.
 * Used by scripts/seed-supabase.mjs and POST /api/admin/seed
 */

import { COURSE_CATALOG } from '../../src/config/coursesCatalog.js'
import { ASSESSMENT_CATALOG } from '../../src/config/assessmentCatalog.js'
import { STUDENT_PORTFOLIO } from '../../src/config/showcasePortfolio.js'
import {
  SHOWCASE_AWARD_CASES,
  SHOWCASE_ADMISSIONS_CASES,
  SHOWCASE_ABILITY_CASES,
} from '../../src/config/seed/showcaseCases.js'
import {
  EVENT_LIST,
  MALL_COURSES,
  MALL_PRODUCTS,
  RESEARCH_CAMPS,
  RESEARCH_FACULTY,
  CAREER_JOBS,
  CERT_TIERS,
  COMMUNITY_MENTORS,
  FORUM_THREADS,
  CHARITY_REPORTS,
  CHARITY_PROJECTS,
  HOME_TRUST_STATS,
  HOME_TESTIMONIALS,
  HOME_BANNER_SLIDES,
} from '../../src/config/seed/siteFallbacks.js'

async function tableCount(admin, table) {
  const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true })
  if (error) throw new Error(`${table}: ${error.message}`)
  return count ?? 0
}

async function clearTable(admin, table) {
  const { error } = await admin.from(table).delete().gte('created_at', '1970-01-01T00:00:00Z')
  if (error && !error.message.includes('does not exist')) {
    const { error: e2 } = await admin.from(table).delete().not('id', 'is', null)
    if (e2) throw new Error(`clear ${table}: ${e2.message}`)
  }
}

function showcaseRow(item, sortOrder) {
  return {
    type: item.type,
    student: item.student || null,
    grade: item.grade || null,
    pain: item.pain || null,
    path: item.path || null,
    result: item.result || '—',
    detail: item.detail || null,
    duration: item.duration || null,
    tags: item.tags || [],
    improvement: item.improvement || null,
    sort_order: sortOrder,
  }
}

export async function runSiteSeed(admin, { force = false } = {}) {
  const summary = {}

  async function seedSimple(table, rows, label) {
    const n = await tableCount(admin, table)
    if (n > 0 && !force) {
      summary[label] = { skipped: true, existing: n }
      return
    }
    if (force && n > 0) await clearTable(admin, table)
    if (!rows.length) {
      summary[label] = { inserted: 0 }
      return
    }
    const { error } = await admin.from(table).insert(rows)
    if (error) throw new Error(`${table}: ${error.message}`)
    summary[label] = { inserted: rows.length }
  }

  // Home
  await seedSimple(
    'home_stats',
    HOME_TRUST_STATS.map((s, i) => ({
      icon: s.icon,
      value: s.value,
      label: s.label,
      sort_order: i,
    })),
    'home_stats'
  )

  await seedSimple(
    'home_testimonials',
    HOME_TESTIMONIALS.map((t, i) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      stars: t.stars ?? 5,
      sort_order: i,
    })),
    'home_testimonials'
  )

  // Showcase cases
  const showcaseRows = [
    ...SHOWCASE_AWARD_CASES.map((c, i) => showcaseRow(c, i)),
    ...SHOWCASE_ADMISSIONS_CASES.map((c, i) => showcaseRow(c, 100 + i)),
    ...SHOWCASE_ABILITY_CASES.map((c, i) => showcaseRow(c, 200 + i)),
  ]
  await seedSimple('showcase_cases', showcaseRows, 'showcase_cases')

  // Mall courses (courses table)
  await seedSimple(
    'courses',
    MALL_COURSES.map((c) => ({
      name: c.name,
      type: c.type || 'course',
      cat: c.cat,
      tag: c.tag,
      price: c.price,
      b_price: c.bPrice,
      sold: c.sold ?? 0,
      rating: c.rating,
      desc: c.desc,
      badge: c.badge,
      ai_lab: !!c.aiLab,
    })),
    'courses'
  )

  await seedSimple(
    'events',
    EVENT_LIST.map((e) => ({
      name: e.name,
      type: e.type,
      stage: e.stage,
      students: e.students,
      award: e.award,
      enrolled: e.enrolled ?? 0,
      whitelist: !!e.whitelist,
      ai_course: !!e.aiCourse,
      desc: e.desc,
    })),
    'events'
  )

  await seedSimple(
    'mall_products',
    MALL_PRODUCTS.map((p, i) => ({
      name: p.name,
      type: p.type,
      tag: p.tag,
      price: p.price,
      b_price: p.bPrice,
      desc: p.desc,
      deadline: p.deadline || null,
      sort_order: i,
    })),
    'mall_products'
  )

  await seedSimple(
    'research_camps',
    RESEARCH_CAMPS.map((c, i) => ({
      title: c.title,
      age: c.age,
      icon: c.icon,
      direction: c.direction,
      core: c.core,
      highlight: c.highlight,
      outcome: c.outcome,
      ratio: c.ratio,
      competition: c.competition,
      price: c.price,
      weeks: c.weeks,
      sort_order: i,
    })),
    'research_camps'
  )

  await seedSimple(
    'research_faculty',
    RESEARCH_FACULTY.map((f, i) => ({
      name: f.name,
      team: f.team,
      area: f.area,
      exp: f.exp,
      philosophy: f.philosophy,
      type: f.type,
      sort_order: i,
    })),
    'research_faculty'
  )

  await seedSimple(
    'career_jobs',
    CAREER_JOBS.map((j, i) => ({
      title: j.title,
      company: j.company,
      level: j.level,
      salary: j.salary,
      location: j.location,
      skill: j.skill,
      course_linked: !!j.courseLinked,
      sort_order: i,
    })),
    'career_jobs'
  )

  await seedSimple(
    'cert_tiers',
    CERT_TIERS.map((t, i) => ({
      tier_id: t.id,
      stars: t.stars,
      name: t.name,
      chinese: t.chinese,
      color: t.color,
      bg: t.bg,
      border: t.border,
      inst: t.inst,
      teacher: t.teacher,
      learner: t.learner,
      weeks: t.weeks,
      courses: t.courses,
      criteria: t.criteria,
      benefits: t.benefits,
      sort_order: i,
    })),
    'cert_tiers'
  )

  await seedSimple(
    'community_mentors',
    COMMUNITY_MENTORS.map((m, i) => ({
      name: m.name,
      title: m.title,
      photo: m.photo,
      tag: m.tag,
      intro: m.intro,
      awards: m.awards,
      type: m.type,
      sort_order: i,
    })),
    'community_mentors'
  )

  await seedSimple(
    'charity_reports',
    CHARITY_REPORTS.map((r, i) => ({
      type: r.type,
      text: r.text,
      report_date: r.report_date,
      sort_order: i,
    })),
    'charity_reports'
  )

  await seedSimple(
    'charity_projects',
    CHARITY_PROJECTS.map((p, i) => ({
      title: p.title,
      desc: p.desc,
      sort_order: i,
    })),
    'charity_projects'
  )

  // Forum (threads + replies)
  {
    const n = await tableCount(admin, 'forum_threads')
    if (n === 0 || force) {
      if (force && n > 0) {
        await clearTable(admin, 'forum_replies')
        await clearTable(admin, 'forum_threads')
      }
      let replyCount = 0
      for (const thread of FORUM_THREADS) {
        const { data: inserted, error } = await admin
          .from('forum_threads')
          .insert({
            title: thread.title,
            content: thread.content,
            author: thread.author,
            avatar: thread.avatar,
            category: thread.category,
          })
          .select('id')
          .single()
        if (error) throw new Error(`forum_threads: ${error.message}`)
        if (thread.replies?.length) {
          const rows = thread.replies.map((r) => ({
            thread_id: inserted.id,
            content: r.content,
            author: r.author,
            avatar: r.avatar,
          }))
          const { error: re } = await admin.from('forum_replies').insert(rows)
          if (re) throw new Error(`forum_replies: ${re.message}`)
          replyCount += rows.length
        }
      }
      summary.forum = { threads: FORUM_THREADS.length, replies: replyCount }
    } else {
      summary.forum = { skipped: true, existing: n }
    }
  }

  // courses_catalog (slug upsert)
  {
    const rows = COURSE_CATALOG.map((c, i) => ({
      slug: c.id,
      line: c.line,
      sub: c.sub,
      status: c.status,
      delivery_type: c.deliveryType,
      featured: !!c.featured,
      name: c.name,
      name_en: c.nameEn || c.name,
      description: c.desc,
      price: c.price,
      hours: c.hours,
      badge: c.badge,
      audience: c.audience,
      outcomes: c.outcomes || [],
      syllabus: c.syllabus || [],
      lab_slugs: c.labSlugs || [],
      sort_order: i,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await admin.from('courses_catalog').upsert(rows, { onConflict: 'slug' })
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`courses_catalog: ${error.message}`)
    }
    summary.courses_catalog = error?.message.includes('does not exist')
      ? { skipped: true, hint: 'Run migration 007_courses_catalog_portfolio.sql' }
      : { upserted: rows.length }
  }

  // portfolio_works
  {
    const rows = STUDENT_PORTFOLIO.map((p, i) => ({
      id: p.id,
      title: p.title,
      student: p.student,
      category: p.category,
      track: p.track,
      year: p.year,
      gradient: p.gradient,
      emoji: p.emoji,
      tags: p.tags || [],
      blurb: p.blurb,
      link: p.link,
      sort_order: i,
    }))
    const { error } = await admin.from('portfolio_works').upsert(rows, { onConflict: 'id' })
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`portfolio_works: ${error.message}`)
    }
    summary.portfolio_works = error?.message.includes('does not exist')
      ? { skipped: true, hint: 'Run migration 007' }
      : { upserted: rows.length }
  }

  // platform_settings JSON blobs
  const settings = [
    { key: 'home_banners', value: HOME_BANNER_SLIDES },
    { key: 'assessment_catalog', value: ASSESSMENT_CATALOG },
  ]
  for (const { key, value } of settings) {
    const { error } = await admin.from('platform_settings').upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`platform_settings.${key}: ${error.message}`)
    }
  }
  summary.platform_settings = { keys: settings.map((s) => s.key) }

  return summary
}
