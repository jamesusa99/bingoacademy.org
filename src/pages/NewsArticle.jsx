import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { NEWS_CATEGORIES } from '../config/newsArticles'
import { SITE_URL } from '../config/siteSeo'
import { fetchNewsArticleBySlug } from '../lib/newsArticlesApi'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso
  }
}

export default function NewsArticle() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    fetchNewsArticleBySlug(slug)
      .then((item) => {
        if (cancelled) return
        if (!item) setNotFound(true)
        else setArticle(item)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <PageContent className="py-10 sm:py-14">
        <p className="text-sm text-slate-500">Loading article…</p>
      </PageContent>
    )
  }

  if (notFound || !article) {
    return <Navigate to="/news" replace />
  }

  const cat = NEWS_CATEGORIES.find((c) => c.id === article.category)
  const keywords = article.keywords?.join(', ') || ''

  return (
    <div className="w-full">
      <PageMeta
        title={`${article.title} | BingoAcademy News`}
        description={article.excerpt}
        keywords={keywords}
        ogTitle={article.title}
        ogDescription={article.excerpt}
        ogImage={article.ogImage || undefined}
        ogUrl={`${SITE_URL}/news/${article.slug}`}
        ogType="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          description: article.excerpt,
          datePublished: article.date,
          author: { '@type': 'Organization', name: 'BingoAcademy' },
          publisher: { '@type': 'Organization', name: 'BingoAcademy', url: SITE_URL },
        }}
      />

      <PageContent className="py-10 sm:py-14">
        <nav className="text-sm text-slate-500 mb-6">
          <Link to="/news" className="hover:text-primary">
            ← News
          </Link>
        </nav>

        <article className="max-w-3xl">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              {cat ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-medium text-primary">{cat.label}</span>
                </>
              ) : null}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-4 leading-tight">{article.title}</h1>
            <p className="text-slate-600 leading-relaxed">{article.excerpt}</p>
          </header>

          <div className="prose prose-slate prose-sm sm:prose-base max-w-none">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>

          <footer className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">
              Ready to start?{' '}
              <Link to="/ai-classes-for-kids" className="text-primary font-semibold hover:underline">
                Book a free AI class
              </Link>{' '}
              or explore our{' '}
              <Link to="/usaaio-prep" className="text-primary font-semibold hover:underline">
                USAAIO prep course
              </Link>
              .
            </p>
            <Link to="/news" className="text-sm font-semibold text-primary hover:underline">
              ← All news articles
            </Link>
          </footer>
        </article>
      </PageContent>
    </div>
  )
}
