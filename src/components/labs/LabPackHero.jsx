import {
  Check,
  ChevronRight,
  Clock,
  FlaskConical,
  Infinity,
  Layers,
  Package,
  Shield,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { parseOutcomesList } from '../../lib/catalogCourse'
import LabMaterialPurchaseButton from './LabMaterialPurchaseButton'
import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'
import { labMaterialTypeLabel } from '../../config/labMaterials'

function StatItem({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <Icon className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

function IncludeRow({ icon: Icon, text }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-300">
      <Icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
      <span>{text}</span>
    </li>
  )
}

export default function LabPackHero({
  item,
  pack,
  catalogItem,
  owned,
  comingSoon,
  priceLabel,
  backHref,
  lineLabel,
  totalSteps,
}) {
  const experimentCount = pack?.experimentCount ?? pack?.experiments?.length ?? 0
  const typeLabel = labMaterialTypeLabel(item.sub, item.line)
  const title = item.nameEn || item.name
  const outcomes = parseOutcomesList(item.outcomes)
  const materialsCount = pack?.materialsList?.length ?? 0

  return (
    <section className="lab-pack-hero">
      <nav className="text-xs text-slate-500 mb-6 flex flex-wrap items-center gap-1.5">
        <Link to="/labs" className="hover:text-emerald-400 transition">
          {LAB_EXPERIMENTS_PORTAL.labCenter}
        </Link>
        <span className="text-slate-600">›</span>
        <Link to={backHref} className="hover:text-emerald-400 transition">
          {lineLabel}
        </Link>
        <span className="text-slate-600">›</span>
        <span className="text-slate-400 truncate max-w-[200px] sm:max-w-none">{title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 lg:gap-10 items-start">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-4">
            <FlaskConical className="w-3.5 h-3.5" aria-hidden />
            {typeLabel}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight tracking-tight">
            {title}
          </h1>

          {item.description ? (
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl">
              {item.description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6">
            {experimentCount > 0 ? (
              <StatItem icon={FlaskConical} label={LAB_EXPERIMENTS_PORTAL.experimentCount(experimentCount)} />
            ) : null}
            {totalSteps > 0 ? (
              <StatItem icon={Layers} label={LAB_EXPERIMENTS_PORTAL.stepCount(totalSteps)} />
            ) : null}
            {item.hours ? (
              <StatItem icon={Clock} label={LAB_EXPERIMENTS_PORTAL.durationLabel(item.hours)} />
            ) : null}
            {item.line === 'ioai' ? (
              <StatItem icon={Shield} label={LAB_EXPERIMENTS_PORTAL.trackBadge} />
            ) : null}
          </div>

          {outcomes.length > 0 ? (
            <div className="mt-10 pt-2">
              <h2 className="text-base font-semibold text-white mb-4">{LAB_EXPERIMENTS_PORTAL.outcomesTitle}</h2>
              <ul className="space-y-3.5">
                {outcomes.map((o) => (
                  <li key={o} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" aria-hidden />
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {owned ? (
            <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3">
              <Check className="w-4 h-4 shrink-0" aria-hidden />
              {LAB_EXPERIMENTS_PORTAL.ownedBanner}
            </div>
          ) : null}
        </div>

        <aside className="lab-pack-sidebar card-dark-panel p-6 lg:sticky lg:top-24">
          <div className="text-center lg:text-left">
            <p className="text-4xl font-bold text-white tracking-tight">
              {priceLabel || LAB_EXPERIMENTS_PORTAL.priceUnavailable}
            </p>
            <p className="text-xs text-slate-500 mt-1">{LAB_EXPERIMENTS_PORTAL.purchaseOnce}</p>
          </div>

          <div className="mt-5 space-y-2">
            {owned ? (
              <a
                href="#lab-experiment-list"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm py-3 transition"
              >
                {LAB_EXPERIMENTS_PORTAL.continueLearning}
                <ChevronRight className="w-4 h-4" />
              </a>
            ) : comingSoon ? (
              <span className="w-full block text-center rounded-xl bg-slate-700 text-slate-400 font-semibold text-sm py-3">
                Coming soon
              </span>
            ) : catalogItem ? (
              <LabMaterialPurchaseButton item={catalogItem} sidebar />
            ) : null}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {LAB_EXPERIMENTS_PORTAL.packIncludes}
            </h3>
            <ul className="space-y-2.5">
              {experimentCount > 0 ? (
                <IncludeRow icon={FlaskConical} text={LAB_EXPERIMENTS_PORTAL.includeExperiments(experimentCount)} />
              ) : null}
              {totalSteps > 0 ? (
                <IncludeRow icon={Layers} text={LAB_EXPERIMENTS_PORTAL.includeSteps(totalSteps)} />
              ) : null}
              {materialsCount > 0 ? (
                <IncludeRow icon={Package} text={LAB_EXPERIMENTS_PORTAL.includeMaterials(materialsCount)} />
              ) : null}
              {item.audience ? (
                <IncludeRow icon={Users} text={LAB_EXPERIMENTS_PORTAL.includeAudience(item.audience)} />
              ) : null}
              <IncludeRow icon={Infinity} text={LAB_EXPERIMENTS_PORTAL.includePermanent} />
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
