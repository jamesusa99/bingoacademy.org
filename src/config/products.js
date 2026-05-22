/** Bingo AI Academy · Three product lines */
export const PRODUCT_LINES = [
  {
    id: 'general',
    name: 'Foundations of AI Program',
    nameEn: 'Foundations of AI Program',
    tagline: 'Explore AI literacy on your own — from foundations to hands-on labs',
    color: 'cyan',
    gradient: 'from-cyan-500/15 to-sky-50',
    border: 'border-cyan-200/60',
    icon: '🌐',
    to: '/courses?line=general',
    subcategories: [
      { id: 'course', name: 'AI Literacy Courses', icon: '📘', desc: 'Structured AI literacy and thinking skills' },
      { id: 'online-lab', name: 'Online Labs', icon: '🧪', desc: 'Cloud-based interactive experiments and projects' },
      { id: 'materials-pack', name: 'Online Lab Materials Pack', icon: '📦', desc: 'Consumables and digital resource bundles' },
    ],
  },
  {
    id: 'ioai',
    name: 'IOAI Competition Training',
    nameEn: 'IOAI Competition Training',
    tagline: 'Video courses and training camps for IOAI whitelist competitions',
    color: 'amber',
    gradient: 'from-amber-500/15 to-orange-50',
    border: 'border-amber-200/60',
    icon: '🏆',
    to: '/courses?line=ioai',
    subcategories: [
      { id: 'video', name: 'AI Video Courses', icon: '🎬', desc: 'Competition-focused video lessons with progress tracking' },
      { id: 'online-lab', name: 'Training Camp', icon: '🏕️', desc: 'Intensive competition training camps with mock assessments' },
    ],
  },
  {
    id: 'k12',
    name: 'K12 Classroom School Edition',
    nameEn: 'K12 Classroom School Edition',
    tagline: 'Textbooks, classroom delivery, labs, and materials for schools',
    color: 'violet',
    gradient: 'from-violet-500/15 to-purple-50',
    border: 'border-violet-200/60',
    icon: '🏫',
    to: '/courses?line=k12',
    subcategories: [
      { id: 'books', name: 'Books', icon: '📚', desc: 'Textbooks and supplements — digital and print' },
      { id: 'course', name: 'Courses', icon: '🎓', desc: 'Classroom teaching and school course packs' },
      { id: 'online-lab', name: 'Online Labs', icon: '🧪', desc: 'Class demos and student computer-lab sessions' },
      { id: 'materials-pack', name: 'Online Lab Kits', icon: '📦', desc: 'Class consumables and resource bundles' },
      { id: 'offline-lab', name: 'Offline Labs', icon: '🔬', desc: 'Lab hardware and on-site activity plans' },
      { id: 'school-kit', name: 'Offline Lab Kits', icon: '🛠️', desc: 'Bulk experiment kits for institutions' },
    ],
  },
]

export const SUBCATEGORY_LABELS = Object.fromEntries(
  PRODUCT_LINES.flatMap((line) =>
    line.subcategories.map((s) => [`${line.id}:${s.id}`, s.name])
  )
)

export function getProductLine(id) {
  return PRODUCT_LINES.find((l) => l.id === id) ?? PRODUCT_LINES[0]
}

export function subcategoryLabel(lineId, subId) {
  return SUBCATEGORY_LABELS[`${lineId}:${subId}`] ?? subId
}

/** Course catalogue (frontend; extend DB with product_line + subcategory) */
export const COURSE_CATALOG = [
  { id: 'g1', line: 'general', sub: 'course', name: 'AI Literacy Foundations', desc: 'Core AI concepts, ethics, and creative thinking for self-paced learners.', price: '$299', hours: '12 sessions', badge: 'General' },
  { id: 'g2', line: 'general', sub: 'online-lab', name: 'Cloud AI Exploration Lab', desc: 'Guided online experiments with auto-graded tasks.', price: '$199', hours: '8 labs', badge: 'Online Lab' },
  { id: 'g3', line: 'general', sub: 'materials-pack', name: 'Home Experiment Materials Pack', desc: 'Digital guides + consumables for general AI labs.', price: '$128', hours: 'Kit', badge: 'Materials' },
  { id: 'i1', line: 'ioai', sub: 'video', name: 'AIGC Whitelist Competition Course', desc: 'IOAI-oriented video lessons with lesson progress and certificate path.', price: '$890', hours: '2 lessons + more', badge: 'IOAI' },
  { id: 'i2', line: 'ioai', sub: 'video', name: 'Competition Sprint Video Series', desc: 'Topic selection, project build, and presentation skills.', price: '$999', hours: '16 sessions', badge: 'Video' },
  { id: 'i3', line: 'ioai', sub: 'online-lab', name: 'IOAI Competition Training Camp', desc: 'Intensive camp sessions with simulated whitelist competition tasks.', price: '$490', hours: '10 sessions', badge: 'Training Camp' },
  { id: 'k1', line: 'k12', sub: 'books', name: 'AI Literacy Textbook Series (Grades 3–9)', desc: 'Aligned classroom textbooks — digital and print.', price: '$128', hours: '7 volumes', badge: 'Books' },
  { id: 'k2', line: 'k12', sub: 'course', name: 'K12 Classroom AI Course Pack', desc: 'Teacher slides, student worksheets, and term plans.', price: 'Quote', hours: 'Full term', badge: 'Course' },
  { id: 'k3', line: 'k12', sub: 'online-lab', name: 'Classroom Online Lab License', desc: 'Whole-class cloud lab with teacher dashboard.', price: '$12,800/yr', hours: 'School', badge: 'Online Lab' },
  { id: 'k4', line: 'k12', sub: 'materials-pack', name: 'Class Lab Materials Pack (30 students)', desc: 'Per-class consumables and digital resource bundle.', price: '$2,980', hours: 'Bulk', badge: 'Materials' },
  { id: 'k5', line: 'k12', sub: 'offline-lab', name: 'Offline AI Lab Setup', desc: 'Hardware layout, safety guide, and lesson integration.', price: 'Quote', hours: 'On-site', badge: 'Offline Lab' },
  { id: 'k6', line: 'k12', sub: 'school-kit', name: 'Institution Offline Lab Kits', desc: 'Bulk offline lab kits for recurring classroom sessions.', price: 'Quote', hours: 'Bulk', badge: 'Offline Lab Kits' },
]
