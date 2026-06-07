import { Link } from 'react-router-dom'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { labMaterialTypeLabel, normalizeLabMaterialSub } from '../../config/labMaterials'
import { labsPath } from '../../config/productLabs'
import { getCourseDisplayPrice } from '../../lib/coursePricing'
import CoursePurchasePanel from './CoursePurchasePanel'

export default function LabMaterialCourseDetail({
  item,
  hasAccess,
  hasTrack,
  onUnlockLesson,
  onUnlockTrack,
  purchaseProps,
}) {
  const typeLabel = labMaterialTypeLabel(item.sub, item.line)
  const priceLabel = getCourseDisplayPrice(item)
  const labsBack = labsPath(item.line, normalizeLabMaterialSub(item.sub, item.line))

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded">
          {typeLabel}
        </span>
        {item.deliveryType ? (
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
            {item.deliveryType === 'materials' ? 'Materials kit' : 'Lab session'}
          </span>
        ) : null}
      </div>

      <p className="text-sm text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">
        {item.desc?.trim() || COURSES_PORTAL.labMaterialDefaultDesc}
      </p>

      {item.audience ? (
        <section className="card p-5 mb-4">
          <h2 className="font-bold text-bingo-dark text-sm mb-2">{COURSES_PORTAL.audience}</h2>
          <p className="text-sm text-slate-600">{item.audience}</p>
        </section>
      ) : null}

      {item.outcomes?.length > 0 ? (
        <section className="card p-5 mb-4">
          <h2 className="font-bold text-bingo-dark text-sm mb-3">{COURSES_PORTAL.outcomes}</h2>
          <ul className="space-y-2">
            {item.outcomes.map((o) => (
              <li key={o} className="text-sm text-slate-600 flex gap-2">
                <span className="text-emerald-500 shrink-0">✓</span>
                {o}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.syllabus?.length > 0 ? (
        <section className="card overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark text-sm">
            {COURSES_PORTAL.syllabus}
          </div>
          <ol className="divide-y divide-slate-100">
            {item.syllabus.map((unit, i) => (
              <li key={unit} className="p-4 flex gap-3 text-sm text-slate-700">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {unit}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <CoursePurchasePanel
        course={item}
        hasAccess={hasAccess}
        hasTrack={hasTrack}
        onUnlockLesson={onUnlockLesson}
        onUnlockTrack={onUnlockTrack}
        {...purchaseProps}
      />

      {item.line === 'ioai' ? (
        <section className="card p-5 mt-6 bg-amber-50/50 border-amber-200/60">
          <p className="text-sm text-slate-700 leading-relaxed">
            {COURSES_PORTAL.labMaterialIoaiAddonNote}
          </p>
          <Link to="/courses?line=ioai" className="text-sm text-primary font-semibold hover:underline mt-2 inline-block">
            {COURSES_PORTAL.browseIoaiUnits} →
          </Link>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 justify-center mt-6">
        {hasAccess ? (
          <Link to="/profile/study" className="btn-primary text-sm px-5 py-2.5">
            {COURSES_PORTAL.continueLearning}
          </Link>
        ) : priceLabel ? (
          <Link to={labsBack} className="text-sm px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50">
            ← {COURSES_PORTAL.backToLabs}
          </Link>
        ) : null}
        <Link
          to="/assessment"
          className="text-sm px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5"
        >
          {COURSES_PORTAL.freeAssessment}
        </Link>
      </div>
    </>
  )
}
