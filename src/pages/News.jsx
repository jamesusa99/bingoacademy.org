import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { NEWS_CATEGORIES } from '../config/newsArticles'
import { SITE_DEFAULT_SEO } from '../config/siteSeo'
import { fetchLiveNewsArticles } from '../lib/newsArticlesApi'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso
  }
}

export default function News() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchLiveNewsArticles()
      .then((items) => {
        if (!cancelled) setArticles(items)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="w-full">
      <PageMeta
        title="AI Education News & Insights | BingoAcademy"
        description="Latest articles on AI classes for kids, USAAIO prep, machine learning for high school, AI classroom activities, and IOAI competition training."
        keywords={`${SITE_DEFAULT_SEO.keywords}, AI teaching resources, USAAIO prep course`}
      />

      <PageContent className="py-10 sm:py-14">
        <header className="max-w-3xl mb-10">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">News & Insights</p>
          <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-3">AI Education for K-12</h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Guides for parents and educators — AI classes for kids, AI course for teens, USAAIO preparation, and
            classroom-ready AI lesson plans.
          </p>
          <p className="mt-4 text-sm">
            <Link to="/guides" className="text-primary font-semibold hover:underline">
              Browse versioned knowledge guides →
            </Link>
            <span className="text-slate-500"> — parent decisions, IOAI prep, K–12 deployment, and first-party evidence.</span>
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-8">
          {NEWS_CATEGORIES.map((cat) => (
            <span
              key={cat.id}
              className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-100 text-slate-600"
            >
              {cat.label}
            </span>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading articles…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-slate-500">No articles published yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {sorted.map((article) => {
              const cat = NEWS_CATEGORIES.find((c) => c.id === article.category)
              return (
                <article key={article.slug} className="card p-6 flex flex-col h-full hover:shadow-md transition">
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                    {cat ? (
                      <>
                        <span aria-hidden>·</span>
                        <span className="font-medium text-primary">{cat.label}</span>
                      </>
                    ) : null}
                  </div>
                  <h2 className="text-lg font-bold text-bingo-dark mb-2 leading-snug">
                    <Link to={`/news/${article.slug}`} className="hover:text-primary transition">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">{article.excerpt}</p>
                  <Link
                    to={`/news/${article.slug}`}
                    className="text-sm font-semibold text-primary hover:underline mt-auto"
                  >
                    Read article →
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </PageContent>
    </div>
  )
}
