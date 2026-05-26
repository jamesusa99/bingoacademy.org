import { Link } from 'react-router-dom'
import PageContent from '../components/PageContent'
import StudentPortfolioGallery from '../components/StudentPortfolioGallery'
import { STUDENT_PORTFOLIO } from '../config/showcasePortfolio'
import { SHOWCASE_PORTAL } from '../config/showcasePortal'

export default function ShowcaseWorks() {
  return (
    <PageContent className="py-6 sm:py-8">
      <Link to="/showcase" className="text-primary text-sm hover:underline">
        {SHOWCASE_PORTAL.worksBack}
      </Link>
      <h1 className="text-2xl font-bold text-bingo-dark mt-4 mb-2">{SHOWCASE_PORTAL.worksTitle}</h1>
      <p className="text-slate-600 mb-8 w-full max-w-none leading-relaxed">{SHOWCASE_PORTAL.worksIntro}</p>

      <StudentPortfolioGallery />

      <section className="mt-12 card p-6 bg-slate-50">
        <h2 className="font-bold text-bingo-dark mb-4">{SHOWCASE_PORTAL.submitTitle}</h2>
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          {SHOWCASE_PORTAL.submitBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/community" className="btn-primary text-sm px-5 py-2">
            Community
          </Link>
          <Link to="/assessment" className="text-sm px-5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white">
            {SHOWCASE_PORTAL.assessmentCta}
          </Link>
        </div>
      </section>

      <p className="text-xs text-slate-400 mt-8 text-center">
        {SHOWCASE_PORTAL.worksCount(STUDENT_PORTFOLIO.length)}
      </p>
    </PageContent>
  )
}
