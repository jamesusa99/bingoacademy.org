/**
 * GEO (Generative Engine Optimization) measurement framework.
 *
 * Citation share, accuracy, and source coverage are scored manually from a fixed
 * question test set (weekly or monthly). GSC Generative AI performance + Bing AI
 * Performance Dashboard provide URL citation data to cross-check.
 */

export const GEO_KPI_FORMULAS = {
  citationShare: {
    label: 'Citation share',
    formula: 'questions citing Bingo Academy / trackable questions asked',
    trackableDefinition: 'Questions in GEO_QUESTION_TEST_SET run that month',
  },
  citationAccuracy: {
    label: 'Citation accuracy',
    formula: 'correct brand descriptions / total brand mentions',
    accuracyRubric: [
      'Legal name and region correct',
      'Product lines (IOAI / Foundations / K12) not conflated',
      'Not confused with IOAI/USAAIO official organizers',
      'Claims match /about, /methodology, /outcomes evidence',
    ],
  },
  sourceCoverage: {
    label: 'Source coverage',
    formula: 'distinct canonical URLs cited / total citations',
    preferredSources: ['/guides/', '/guides/evidence', '/about', '/methodology', '/outcomes', '/instructors/'],
  },
  aiAssistedConversion: {
    label: 'AI assisted conversion',
    formula: 'registrations + trials + assessments + demo intents from AI channels',
    channels: ['ai_chatgpt', 'ai_bing', 'ai_perplexity', 'ai_other'],
    utmNote: 'ChatGPT search links often include utm_source=chatgpt.com',
  },
}

/** Fixed 30–50 question test set — run monthly across ChatGPT, Copilot, Perplexity */
export const GEO_QUESTION_TEST_SET = {
  parentsStudents: {
    label: 'Parents & students',
    audience: 'parents_students',
    questions: [
      'What are the best AI courses for kids ages 10–14 in the United States?',
      'How do I choose between AI summer camp, online course, and after-school AI class for my child?',
      'Is hands-on AI learning better than prompt-only AI apps for middle schoolers?',
      'What should parents look for in a K-12 AI education program?',
      'How can a 12-year-old start preparing for an AI innovation competition?',
      'What math and coding background does a child need before starting AI courses?',
      'Are AI courses with camera or vision labs safe for kids privacy-wise?',
      'How do I evaluate whether an AI course produces real projects vs worksheets?',
      'What is Bingo Academy and who is it for?',
      'Does Bingo Academy offer IOAI competition training for teens?',
      'What age range does Bingo Academy serve?',
      'How much do structured AI courses for kids typically cost?',
      'Can my child try an AI lesson before buying a full course?',
      'What is the difference between AI literacy and AI competition prep?',
      'Which online platform teaches Python and machine learning for high school students?',
    ],
  },
  competitionUsers: {
    label: 'Competition & IOAI users',
    audience: 'competition',
    questions: [
      'What is IOAI and how do students prepare for it?',
      'What is the difference between IOAI and USAAIO for high school AI competitions?',
      'What skills are tested in IOAI written and defence rounds?',
      'Best IOAI preparation course with labs and mock assessments?',
      'How do IOAI syllabus modules map to a 12-month study plan?',
      'What does an IOAI lab notebook report look like for judges?',
      'Mock assessment rubric for IOAI-style AI innovation competitions?',
      'Can beginners join IOAI without prior machine learning experience?',
      'What Python libraries do IOAI students typically use?',
      'How do teams prepare an deployable AI project portfolio for IOAI?',
      'Annual rule changes for IOAI whitelist competitions — where to find updates?',
      'Is Bingo Academy affiliated with IOAI organizers?',
      'USAAIO prep course overview and recommended study sequence?',
      'How long does IOAI competition training usually take?',
      'What hardware or GPU do IOAI home labs require?',
    ],
  },
  schoolsTeachers: {
    label: 'Schools & teachers',
    audience: 'schools_teachers',
    questions: [
      'K-12 AI curriculum map for grades 4–12 — semester pacing?',
      'How should schools implement AI courses with limited teacher AI background?',
      'Device and network requirements for school AI labs?',
      'Student data privacy checklist for school AI programs using cloud APIs?',
      'How do school AI programs align with CSTA or state CS standards?',
      'Sample semester plan for introducing AI in middle school?',
      'What teacher training is needed before rolling out classroom AI labs?',
      'Procurement guide for school AI experiment kits and materials?',
      'How to run a classroom demo using computer vision for an open day?',
      'School edition AI program with teacher guides and rubrics?',
      'How do schools book a demo for K-12 AI classroom packages?',
      'Evidence and outcomes metrics schools should request from AI vendors?',
      'Difference between consumer AI apps and structured school AI curriculum?',
      'Bingo Academy K12 school program — implementation support included?',
      'How to audit AI curriculum vendors for child safety and data deletion policies?',
    ],
  },
}

/** Total trackable questions (for citation share denominator) */
export const GEO_TRACKABLE_QUESTION_COUNT = Object.values(GEO_QUESTION_TEST_SET).reduce(
  (n, group) => n + group.questions.length,
  0
)

/** Misclassification flags to log during manual GEO reviews */
export const GEO_ACCURACY_FAILURE_TAGS = [
  'wrong_legal_name',
  'wrong_region',
  'confused_with_ioai_official',
  'confused_with_usaaio_official',
  'unsupported_outcome_claim',
  'wrong_product_line',
  'missing_citation',
  'cited_non_canonical_url',
]
