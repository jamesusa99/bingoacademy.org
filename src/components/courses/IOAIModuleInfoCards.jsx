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

/**
 * Three overview cards: intro, objectives, outcomes.
 */
export default function IOAIModuleInfoCards({ intro, objectives, outcomes }) {
  const cards = [
    {
      key: 'intro',
      title: COURSES_PORTAL.moduleIntroTitle,
      icon: BookOpen,
      iconBg: 'bg-sky-50 text-sky-600',
      body: (
        <p className="text-sm text-slate-600 leading-relaxed">
          {intro || 'Explore this unit with guided video lessons and hands-on practice aligned to the IOAI curriculum.'}
        </p>
      ),
    },
    {
      key: 'objectives',
      title: COURSES_PORTAL.moduleObjectivesTitle,
      icon: Target,
      iconBg: 'bg-emerald-50 text-emerald-600',
      body: (
        <ul className="space-y-2">
          {objectives.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'outcomes',
      title: COURSES_PORTAL.moduleOutcomesTitle,
      icon: Sparkles,
      iconBg: 'bg-violet-50 text-violet-600',
      body: (
        <ul className="space-y-2">
          {outcomes.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
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

export function buildModuleInfoContent({ mod, detail, lessons, marketingTags = [] }) {
  const intro =
    stripHtml(detail?.intro_html || mod?.introHtml) ||
    stripHtml(detail?.summary) ||
    stripHtml(mod?.summary) ||
    ''

  const fromGoals = lessons.flatMap((lesson) => parseListItems(lesson.contentGoals || lesson.intro))
  const fromKnowledge = lessons.flatMap((lesson) => parseListItems(lesson.knowledgePoints))

  const tagObjectives = marketingTags.slice(0, Math.ceil(marketingTags.length / 2))
  const tagOutcomes = marketingTags.slice(Math.ceil(marketingTags.length / 2))

  const objectives =
    tagObjectives.length >= 2
      ? tagObjectives
      : fromGoals.length > 0
        ? fromGoals.slice(0, 5)
        : lessons.slice(0, 4).map((l) => `Understand ${l.title}`)

  const outcomes =
    tagOutcomes.length >= 2
      ? tagOutcomes
      : fromKnowledge.length > 0
        ? fromKnowledge.slice(0, 5)
        : [
            'Apply concepts through guided video lessons',
            'Build confidence with structured practice',
            'Track progress in your Study Center',
          ]

  return { intro, objectives, outcomes }
}
