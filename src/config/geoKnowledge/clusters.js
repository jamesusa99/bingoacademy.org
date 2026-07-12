/** GEO knowledge cluster metadata — citable, versioned, expert-sourced */

export const GEO_CLUSTERS = [
  {
    id: 'parents',
    title: 'Parent Decision Guides',
    description:
      'Math and coding readiness, age-appropriate projects, course quality signals, privacy, and how to evaluate project-based outcomes.',
    icon: '👨‍👩‍👧',
    path: '/guides/parents',
  },
  {
    id: 'ioai',
    title: 'IOAI & USAAIO Guides',
    description:
      'Competition pathways, official syllabus mapping, preparation routes, mock assessment rubrics, and annual rule updates with citations.',
    icon: '🏆',
    path: '/guides/ioai',
  },
  {
    id: 'k12',
    title: 'K–12 School Guides',
    description:
      'Grade-band curriculum maps, teacher implementation, device requirements, procurement, data protection, and sample term plans.',
    icon: '🏫',
    path: '/guides/k12',
  },
  {
    id: 'evidence',
    title: 'First-Party Evidence',
    description:
      'Anonymized outcomes, pre/post methods, scoring rubrics, completion data, deployment cases, and teacher feedback Bingo Academy can uniquely cite.',
    icon: '📊',
    path: '/guides/evidence',
  },
]

export function getCluster(id) {
  return GEO_CLUSTERS.find((c) => c.id === id) || null
}
