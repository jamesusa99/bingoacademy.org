import { COURSE_STATUS } from '../config/coursesCatalog'
import { isCurriculumLine } from '../config/programCurriculum'
import { fetchCurriculumFromDb } from './ioaiCurriculumDb'
import { fetchIoaiStore } from './ioaiStore'

function isHtmlResponse(text) {
  return text.trimStart().startsWith('<!')
}

async function parseJsonResponse(res) {
  const text = await res.text()
  if (!text) return { ok: res.ok, body: {} }
  try {
    return { ok: res.ok, body: JSON.parse(text) }
  } catch {
    if (isHtmlResponse(text)) {
      throw new Error('Program store API unavailable (received HTML instead of JSON).')
    }
    throw new Error(`Failed to load program store (${res.status})`)
  }
}

/** Map lightweight curriculum tree → store levels shape for module cards */
export function mapCurriculumTreeToStoreLevels(tree) {
  return (tree || []).map((level) => ({
    id: level.id,
    title: level.title,
    emoji: level.emoji || '',
    themes: (level.themes || []).map((theme) => ({
      id: theme.id,
      title: theme.title,
      categoryLabel: theme.categoryLabel || theme.title,
      modules: (theme.modules || [])
        .filter((mod) => mod.catalogSlug)
        .map((mod) => ({
          id: mod.id,
          catalogSlug: mod.catalogSlug,
          title: mod.title,
          status: COURSE_STATUS.LIVE,
          coverUrl: mod.coverUrl || null,
          introHtml: mod.introHtml || '',
          priceCents: mod.priceCents ?? null,
          extrasPriceCents: null,
          totalPriceCents: mod.priceCents ?? null,
          compareAtCents: mod.compareAtCents ?? null,
          currency: mod.currency || 'usd',
          lessonCount: mod.lessons?.length ?? 0,
          marketingTags: mod.marketingTags || [],
          lessons: (mod.lessons || []).map((lesson) => ({
            id: lesson.catalogSlug || lesson.id,
            catalogSlug: lesson.catalogSlug || lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            intro: lesson.intro || '',
            trialEnabled: Boolean(lesson.trialEnabled),
            sortOrder: lesson.sortOrder ?? 0,
            cloudflareVideoId: lesson.cloudflareVideoId || null,
          })),
        })),
    })),
  }))
}

async function fetchProgramStoreFromCurriculum(productLine) {
  const { tree, error } = await fetchCurriculumFromDb(productLine)
  if (error) throw new Error(error)
  return {
    levels: mapCurriculumTreeToStoreLevels(tree),
    productLine,
    bundles: [],
    labBundles: [],
    fullBundle: null,
  }
}

export async function fetchProgramStore(productLine) {
  if (!isCurriculumLine(productLine)) {
    throw new Error(`Unknown product line: ${productLine}`)
  }

  try {
    const res = await fetch(`/api/program/${encodeURIComponent(productLine)}/store`)
    const { ok, body } = await parseJsonResponse(res)
    if (ok) return body
    throw new Error(body.error || `Failed to load program store (${res.status})`)
  } catch (primaryErr) {
    if (productLine === 'ioai') {
      try {
        const data = await fetchIoaiStore()
        return {
          levels: data.levels || [],
          productLine,
          bundles: data.bundles || [],
          labBundles: data.labBundles || [],
          fullBundle: data.fullBundle || null,
        }
      } catch {
        // fall through to Supabase client
      }
    }

    try {
      return await fetchProgramStoreFromCurriculum(productLine)
    } catch {
      throw primaryErr
    }
  }
}
