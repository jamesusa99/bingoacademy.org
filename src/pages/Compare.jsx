import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { COMPARISON_ROWS, PROGRAMS, PAGE_SEO, programPath, coursesPathForProgram } from '../config/programs'

function CellValue({ value }) {
  if (value === true) return <span className="text-emerald-600 font-medium">✅</span>
  if (value === false) return <span className="text-slate-300">—</span>
  return <span>{value}</span>
}

export default function Compare() {
  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.compare.title} description={PAGE_SEO.compare.description} />

      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-50/50 py-10 sm:py-12">
        <div className="page-content text-center max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark">Which Program is Right for You?</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Three product lines for different learners — compare features and pick your path.
          </p>
        </div>
      </section>

      <PageContent className="py-8 sm:py-10">
        <div className="card overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 font-semibold text-slate-600 w-[28%]">Feature</th>
                  <th className="p-4 font-semibold text-bingo-dark text-center">
                    <span className="text-lg">🎓</span>
                    <div className="mt-1">Foundations</div>
                  </th>
                  <th className="p-4 font-semibold text-bingo-dark text-center">
                    <span className="text-lg">🏆</span>
                    <div className="mt-1">IOAI</div>
                  </th>
                  <th className="p-4 font-semibold text-bingo-dark text-center">
                    <span className="text-lg">🏫</span>
                    <div className="mt-1">K12 School</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 text-slate-700 font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-slate-600">
                      <CellValue value={row.foundations} />
                    </td>
                    <td className="p-4 text-center text-slate-600">
                      <CellValue value={row.ioai} />
                    </td>
                    <td className="p-4 text-center text-slate-600">
                      <CellValue value={row.k12} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PROGRAMS.map((p) => (
            <div key={p.slug} className="card p-5 flex flex-col">
              <span className="text-3xl">{p.icon}</span>
              <h3 className="font-bold text-bingo-dark mt-2">{p.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex-1">{p.audience}</p>
              <Link
                to={programPath(p.slug)}
                className="mt-4 btn-primary text-center text-sm py-2.5 min-h-[44px] inline-flex items-center justify-center"
              >
                {p.cta} →
              </Link>
              <Link
                to={coursesPathForProgram(p.slug)}
                className="mt-2 text-xs text-center text-primary hover:underline"
              >
                Browse courses
              </Link>
            </div>
          ))}
        </div>
      </PageContent>
    </div>
  )
}
