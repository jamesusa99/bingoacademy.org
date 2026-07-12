import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import NotFound from './NotFound'
import { NEWS_CATEGORIES } from '../config/newsArticles'
import { SITE_URL } from '../config/siteSeo'
import { fetchNewsArticleBySlug } from '../lib/newsArticlesApi'
import { getInstructor } from '../config/trust/instructors'
import {
  buildGraph,
  newsArticleEntity,
  personEntity,
  breadcrumbEntity,
} from '../config/structuredData'

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
    return <NotFound status={404} />
  }

  const cat = NEWS_CATEGORIES.find((c) => c.id === article.category)
  const keywords = article.keywords?.join(', ') || ''
  const articlePath = `/news/${article.slug}`
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'News', href: '/news' },
    { label: article.title },
  ]
  const authorInstructor = article.authorSlug ? getInstructor(article.authorSlug) : null
  const jsonLd = buildGraph(
    newsArticleEntity(article, articlePath),
    breadcrumbEntity(breadcrumbs, articlePath),
    authorInstructor
      ? personEntity({
          slug: authorInstructor.slug,
          name: authorInstructor.name,
          title: authorInstructor.title,
          image: authorInstructor.photo,
          description: authorInstructor.bio,
        })
      : null
  )

  return (
    <div className="w-full">
      <PageMeta
        title={`${article.title} | BingoAcademy News`}
        description={article.excerpt}
        keywords={keywords}
        ogTitle={article.title}
        ogDescription={article.excerpt}
        ogImage={article.ogImage || undefined}
        ogUrl={`${SITE_URL}${articlePath}`}
        ogType="article"
        jsonLd={jsonLd}
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
              {article.updatedAt && article.updatedAt !== article.date ? (
                <>
                  <span aria-hidden>·</span>
                  <span>Updated {formatDate(article.updatedAt)}</span>
                </>
              ) : null}
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
