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
      { id: 'course', name: 'AI Video Courses', icon: '📘', desc: 'Self-paced AI video lessons with progress tracking' },
      { id: 'online-lab', name: 'Online Labs', icon: '🧪', desc: 'Cloud-based interactive experiments and projects' },
      { id: 'materials-pack', name: 'Online Lab Kits', icon: '📦', desc: 'Home experiment kits and digital resource bundles' },
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
      { id: 'course', name: 'AI Video Courses', icon: '🎓', desc: 'Classroom video courses and school course packs' },
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

export {
  COURSE_CATALOG,
  COURSE_STATUS,
  getCourseById,
  isCourseComingSoon,
  coursesByLine,
} from './coursesCatalog.js'
