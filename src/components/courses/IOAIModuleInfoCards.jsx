import { BookOpen, Check, Sparkles, Target } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseListItems(text) {
  if (!text) return []
  return text
    .split(/\n|;|•/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function EmptyHint() {
  return <p className="text-sm text-slate-400 italic">{COURSES_PORTAL.moduleInfoEmpty}</p>
}

/**
 * Three overview cards: intro (模块简介), objectives (学习目标), outcomes (学习收获).
 */
export default function IOAIModuleInfoCards({ intro, objectives, outcomes }) {
  const cards = [
    {
      key: 'intro',
      title: COURSES_PORTAL.moduleIntroTitle,
      icon: BookOpen,
      iconBg: 'bg-sky-50 text-sky-600',
      body: intro ? (
        <p className="text-sm text-slate-600 leading-relaxed">{intro}</p>
      ) : (
        <EmptyHint />
      ),
    },
    {
      key: 'objectives',
      title: COURSES_PORTAL.moduleObjectivesTitle,
      icon: Target,
      iconBg: 'bg-emerald-50 text-emerald-600',
      body:
        objectives.length > 0 ? (
          <ul className="space-y-2">
            {objectives.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHint />
        ),
    },
    {
      key: 'outcomes',
      title: COURSES_PORTAL.moduleOutcomesTitle,
      icon: Sparkles,
      iconBg: 'bg-violet-50 text-violet-600',
      body:
        outcomes.length > 0 ? (
          <ul className="space-y-2">
            {outcomes.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyHint />
        ),
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {cards.map(({ key, title, icon: Icon, iconBg, body }) => (
        <article key={key} className="card p-5 h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
              <Icon className="w-4.5 h-4.5" aria-hidden />
            </span>
            <h2 className="text-sm font-bold text-bingo-dark">{title}</h2>
          </div>
          {body}
        </article>
      ))}
    </div>
  )
}

/** Map L3 module fields → three storefront cards. */
export function buildModuleInfoContent({ mod, detail }) {
  const intro = stripHtml(detail?.summary || mod?.summary || '')
  const objectives = parseListItems(
    detail?.learning_objectives || mod?.learningObjectives || ''
  )
  const outcomes = parseListItems(detail?.learning_outcomes || mod?.learningOutcomes || '')

  return { intro, objectives, outcomes }
}
