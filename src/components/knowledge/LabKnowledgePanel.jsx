import { Link } from 'react-router-dom'

/**
 * Crawlable lab knowledge base — shown below each exploration experiment.
 */
export default function LabKnowledgePanel({ knowledge, experimentTitle }) {
  if (!knowledge) return null

  const sectionCls = 'border-t border-slate-700/50 pt-8 mt-8'
  const headingCls = 'text-base font-bold text-white mb-3'
  const textCls = 'text-sm text-slate-300 leading-relaxed'

  return (
    <aside
      id="lab-knowledge"
      className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 sm:p-8 mt-8 scroll-mt-24"
      itemScope
      itemType="https://schema.org/LearningResource"
    >
      <meta itemProp="name" content={experimentTitle} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2">
        Lab knowledge base · v{knowledge.version} · updated {knowledge.updatedAt}
      </p>
      <h2 className="text-xl font-bold text-white mb-1">What you are learning</h2>
      <p className={`${textCls} mb-6`} itemProp="description">
        This page is a citable learning resource — not only a game. Use it for reports, parent briefings, and classroom prep.
      </p>

      <section className={sectionCls}>
        <h3 className={headingCls}>Learning goals</h3>
        <ul className={`${textCls} list-disc pl-5 space-y-1`}>
          {knowledge.learningGoals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Core concepts</h3>
        <p className={textCls}>{knowledge.coreConcepts.join(' · ')}</p>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Models & datasets</h3>
        <p className={textCls}>{knowledge.modelsAndData}</p>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Input & output</h3>
        <dl className={`${textCls} space-y-2`}>
          <div>
            <dt className="font-semibold text-slate-200 inline">Input: </dt>
            <dd className="inline">{knowledge.inputOutput.input}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-200 inline">Output: </dt>
            <dd className="inline">{knowledge.inputOutput.output}</dd>
          </div>
        </dl>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Steps</h3>
        <ol className={`${textCls} list-decimal pl-5 space-y-1`}>
          {knowledge.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Expected results</h3>
        <p className={textCls}>{knowledge.expectedResults}</p>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Why this happens</h3>
        <p className={textCls}>{knowledge.whyItWorks}</p>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Common mistakes</h3>
        <ul className={`${textCls} list-disc pl-5 space-y-1`}>
          {knowledge.commonMistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Extension challenges</h3>
        <ul className={`${textCls} list-disc pl-5 space-y-1`}>
          {knowledge.extensions.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>

      <section className={sectionCls}>
        <h3 className={headingCls}>Safety & privacy</h3>
        <p className={textCls}>{knowledge.safetyPrivacy}</p>
      </section>

      {knowledge.relatedCourses?.length ? (
        <section className={sectionCls}>
          <h3 className={headingCls}>Related courses</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {knowledge.relatedCourses.map((c) => (
              <Link
                key={c.href}
                to={c.href}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-[10px] text-slate-500 mt-6">
        Cite: {experimentTitle} — Bingo Academy Exploration Lab (v{knowledge.version}, {knowledge.updatedAt})
      </p>
    </aside>
  )
}
