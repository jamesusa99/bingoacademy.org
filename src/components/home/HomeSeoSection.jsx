/** @deprecated Phase-1 homepage — replaced by HomeFaqSection + HOME_FAQ in homePage.js. */
import { HOME_SEO_TOPICS } from '../../config/seoKeywords'
import HomePrimaryCtaPair from './HomePrimaryCtaPair'

/** Keyword-rich SEO section for homepage — IOAI-oriented, ages 12–18 */
export default function HomeSeoSection() {
  return (
    <section className="w-full border-t border-slate-200 bg-slate-50/80">
      <div className="page-content py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">IOAI-oriented training</p>
          <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark mb-3">
            AI Olympiad prep for middle and high school students
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Bingo Academy helps students ages 12–18 learn{' '}
            <strong className="font-semibold text-slate-700">AI fundamentals</strong>, implement models in{' '}
            <strong className="font-semibold text-slate-700">Python</strong>, run{' '}
            <strong className="font-semibold text-slate-700">machine learning experiments</strong>, and prepare for{' '}
            <strong className="font-semibold text-slate-700">IOAI-style competition problem solving</strong>.
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

        <HomePrimaryCtaPair hint="Parents and students — start with the free assessment, then review the syllabus together." />
      </div>
    </section>
  )
}
