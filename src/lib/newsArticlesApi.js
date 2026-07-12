import { supabase } from './supabase'
import { NEWS_ARTICLES_FALLBACK } from '../config/newsArticles'

/** @typedef {import('../config/newsArticles').NewsArticle} NewsArticle */

export function mapNewsRow(row) {
  if (!row) return null
  const published = row.published_at || row.date
  const updated = row.updated_at || published
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    body: row.body || '',
    category: row.category,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    date: typeof published === 'string' ? published.slice(0, 10) : published,
    updatedAt: typeof updated === 'string' ? updated.slice(0, 10) : updated,
    status: row.status,
    ogImage: row.og_image || null,
    authorSlug: row.author_slug || row.authorSlug || null,
    authorName: row.author_name || row.authorName || null,
    sortOrder: row.sort_order ?? 0,
  }
}

export async function fetchLiveNewsArticles() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('[news] fetch failed, using fallback:', error.message)
    return [...NEWS_ARTICLES_FALLBACK]
  }

  if (!data?.length) {
    return [...NEWS_ARTICLES_FALLBACK]
  }

  return data.map(mapNewsRow)
}

export async function fetchNewsArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .maybeSingle()

  if (error) {
    console.warn('[news] article fetch failed:', error.message)
    return NEWS_ARTICLES_FALLBACK.find((a) => a.slug === slug) || null
  }

  if (data) return mapNewsRow(data)
  return NEWS_ARTICLES_FALLBACK.find((a) => a.slug === slug) || null
}

export async function fetchAllNewsArticlesForAdmin() {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data || []).map(mapNewsRow)
}
