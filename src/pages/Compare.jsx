import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { PAGE_SEO, PROGRAM_COMPARISON } from '../config/programs'

function Cell({ value }) {
  if (value === true) return <span className="text-emerald-600 font-medium">✅</span>
  if (value === false) return <span className="text-slate-300">—</span>
  return <span>{value}</span>
}

export default function Compare() {
  const { title, columns, rows } = PROGRAM_COMPARISON

  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.compare.title} description={PAGE_SEO.compare.description} />

      <PageContent className="py-10 sm:py-14">
        <h1 className="text-3xl font-black text-bingo-dark mb-2">{title}</h1>
        <p className="text-slate-600 mb-8 max-w-2xl">
          Three programs for self-learners, competition teams, and schools — pick the path that matches your goal.
        </p>

        <div className="card overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Feature</th>
                  {columns.map((col) => (
                    <th key={col.key} className="p-4 font-semibold text-bingo-dark">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.feature} className="border-t border-slate-100">
                    <td className="p-4 text-slate-600 font-medium">{row.feature}</td>
                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-center">
                        <Cell value={row[col.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {columns.map((col) => (
            <Link key={col.key} to={col.href} className="btn-primary px-5 py-2.5 text-sm min-h-[44px]">
              {col.label} →
            </Link>
          ))}
        </div>
      </PageContent>
    </div>
  )
}
