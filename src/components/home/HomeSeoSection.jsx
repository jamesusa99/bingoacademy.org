import { Link } from 'react-router-dom'
import { HOME_SEO_TOPICS } from '../../config/seoKeywords'

/** Keyword-rich SEO section for homepage — natural language, not keyword stuffing */
export default function HomeSeoSection() {
  return (
    <section className="w-full border-t border-slate-200 bg-slate-50/80">
      <div className="page-content py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">K-12 AI Education</p>
          <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark mb-3">
            AI courses, coding classes & competition training
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            BingoAcademy offers{' '}
            <strong className="font-semibold text-slate-700">AI classes for kids</strong> and an{' '}
            <strong className="font-semibold text-slate-700">AI course for teens</strong> — helping families{' '}
            <strong className="font-semibold text-slate-700">learn artificial intelligence for children</strong>{' '}
            through projects, not prompts alone.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {HOME_SEO_TOPICS.map((topic) => (
            <article key={topic.title} className="card p-5 sm:p-6">
              <h3 className="font-bold text-bingo-dark text-sm sm:text-base mb-2">{topic.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{topic.body}</p>
            </article>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-600 mb-4">
            US families: start with a{' '}
            <Link to="/ai-classes-for-kids" className="text-primary font-semibold hover:underline">
              free AI trial class
            </Link>{' '}
            or explore{' '}
            <Link to="/usaaio-prep" className="text-primary font-semibold hover:underline">
              USAAIO prep
            </Link>
            . Read the latest on our{' '}
            <Link to="/news" className="text-primary font-semibold hover:underline">
              AI education news
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
