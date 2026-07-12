import { getLineDecisionPage } from '../config/courseDecisionPages'
import { formatIoaiPrice } from './ioaiStore'
import { SITE_BRAND } from '../config/siteSeo'

function parseListField(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  const text = String(value).replace(/<[^>]+>/g, '\n')
  return text
    .split(/\n|•|·/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function slugifyAnchor(text, fallback = 'section') {
  const base = String(text || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || fallback
}

/** Build decision-page data for an IOAI / curriculum module */
export function buildModuleDecisionPage({ mod, detail, lessons = [], productLine = 'ioai' }) {
  const title = mod?.title || detail?.title || 'Course module'
  const summary =
    mod?.summary ||
    detail?.summary ||
    detail?.intro_html?.replace(/<[^>]+>/g, ' ').trim() ||
    ''
  const objectives = parseListField(detail?.learning_objectives || mod?.learningObjectives)
  const outcomes = parseListField(detail?.learning_outcomes || mod?.learningOutcomes)

  const lessonMinutes = 14
  const totalWeeks = Math.max(1, Math.ceil((lessons.length * lessonMinutes) / 180))
  const priceCents = mod?.priceCents ?? detail?.price_cents
  const currency = mod?.currency || detail?.currency || 'usd'
  const levelLabel = detail?.theme?.level?.title || mod?.levelTitle || 'Beginner-friendly'

  const directAnswer = [
    summary,
    objectives.length
      ? `You will master: ${objectives.slice(0, 3).join('; ')}.`
      : '',
    outcomes.length ? `Outcomes include ${outcomes.slice(0, 2).join(' and ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, 600)

  const trialLesson = lessons.find((l) => l.trialEnabled && l.cloudflareVideoId)
  const previewLesson = lessons.find((l) => l.cloudflareVideoId)

  const samples = []
  if (trialLesson || previewLesson) {
    const lesson = trialLesson || previewLesson
    samples.push({
      title: trialLesson ? 'Free trial lesson' : 'Sample lesson preview',
      description: lesson.title,
      input: 'Lesson brief & on-screen prompts',
      process: 'Watch → follow lab steps → checkpoint',
      output: 'Notebook cells and quiz feedback',
      href: `/courses/detail/${encodeURIComponent(lesson.catalogSlug)}?play=1`,
      type: 'lesson',
    })
  }
  samples.push({
    title: 'Browser AI lab sampler',
    description: 'No-install experiment to feel the teaching style.',
    input: 'Webcam or keyboard',
    process: 'Guided steps in Exploration Lab',
    output: 'Immediate visual AI result',
    href: '/exploration',
    type: 'experiment',
  })

  const outline = [
    {
      id: slugifyAnchor(title, 'module-outline'),
      title: 'Module syllabus',
      summary: `${lessons.length} lessons · ~${lessons.length * lessonMinutes} minutes video`,
      items: lessons.map((lesson, i) => ({
        id: `lesson-${lesson.catalogSlug || slugifyAnchor(lesson.title, `lesson-${i + 1}`)}`,
        title: lesson.title,
        summary: lesson.intro || lesson.contentGoals || `Lesson ${i + 1}`,
      })),
    },
  ]

  const programDecision = getLineDecisionPage(productLine)

  return {
    directAnswer: directAnswer || programDecision?.directAnswer || '',
    quickFacts: {
      audience: programDecision?.quickFacts?.audience || 'Students ages 12–18',
      prerequisites: levelLabel,
      format: 'Self-paced video + Jupyter/browser labs',
      duration: `${totalWeeks} weeks · ~${lessonMinutes * lessons.length} min video`,
      deliverables: 'Lab notebooks, project checkpoints, module certificate',
      assessment: 'Lesson quizzes · module test · optional cert exam',
      instructor: programDecision?.quickFacts?.instructor || `${SITE_BRAND} faculty team`,
      instructorHref: programDecision?.quickFacts?.instructorHref || '/community/mentors',
      price: priceCents != null ? formatIoaiPrice(priceCents, currency) : 'See checkout',
      priceNote: 'Lifetime access to purchased module content',
      certificate: `${SITE_BRAND} module completion · verify at /cert`,
    },
    outline,
    samples,
    faculty: programDecision?.faculty || [],
    methodology: programDecision?.methodology,
    results: programDecision?.results?.slice(0, 2) || [],
    faq: [
      {
        q: 'How long to finish this module?',
        a: `Plan ${totalWeeks} weeks at 4–5 hours/week including labs and the module test.`,
      },
      {
        q: 'Can I preview before buying?',
        a: trialLesson
          ? 'Yes — start the free trial lesson linked in Samples below.'
          : 'Watch the hero preview video or open a sample exploration lab.',
      },
      {
        q: 'What do I need installed?',
        a: 'Modern browser; Jupyter opens in-cloud. Webcam optional for vision lessons.',
      },
      ...(programDecision?.faq?.slice(0, 3) || []),
    ],
    contentMeta: {
      updatedAt: detail?.updated_at?.slice(0, 10) || programDecision?.contentMeta?.updatedAt,
      author: programDecision?.contentMeta?.author || `${SITE_BRAND} Curriculum`,
      reviewer: programDecision?.contentMeta?.reviewer || 'Academic Review Board',
      references: programDecision?.contentMeta?.references || [],
    },
    primaryCta: { label: 'Unlock full module', href: `#purchase` },
    secondaryCta: programDecision?.secondaryCta,
  }
}

/** Build decision-page data from a catalog course row */
export function buildCatalogCourseDecisionPage(item, lineDecision) {
  if (!item) return null

  const syllabus = (item.syllabus || []).map((row, i) => ({
    id: `syllabus-${slugifyAnchor(row, `unit-${i + 1}`)}`,
    title: row,
    summary: '',
  }))

  const outline =
    syllabus.length > 0
      ? [
          {
            id: 'course-syllabus',
            title: 'Course syllabus',
            summary: item.hours || 'Structured units',
            items: syllabus.map((s) => ({ id: s.id, title: s.title, summary: s.summary })),
          },
        ]
      : lineDecision?.outline || []

  return {
    directAnswer:
      [item.desc, item.audience ? `Designed for ${item.audience}.` : '']
        .filter(Boolean)
        .join(' ') || lineDecision?.directAnswer || '',
    quickFacts: {
      audience: item.audience || lineDecision?.quickFacts?.audience,
      prerequisites: item.level || lineDecision?.quickFacts?.prerequisites,
      format: lineDecision?.quickFacts?.format || 'Self-paced video',
      duration: item.hours || lineDecision?.quickFacts?.duration,
      deliverables:
        (item.outcomes || []).slice(0, 2).join(' · ') ||
        lineDecision?.quickFacts?.deliverables,
      assessment: lineDecision?.quickFacts?.assessment,
      instructor: lineDecision?.quickFacts?.instructor,
      instructorHref: lineDecision?.quickFacts?.instructorHref,
      price: item.price || lineDecision?.quickFacts?.price,
      priceNote: lineDecision?.quickFacts?.priceNote,
      certificate: lineDecision?.quickFacts?.certificate,
    },
    outline,
    samples: lineDecision?.samples || [],
    faculty: lineDecision?.faculty || [],
    methodology: lineDecision?.methodology,
    results: lineDecision?.results || [],
    faq: lineDecision?.faq || [],
    contentMeta: lineDecision?.contentMeta,
    primaryCta: lineDecision?.primaryCta,
    secondaryCta: lineDecision?.secondaryCta,
  }
}
