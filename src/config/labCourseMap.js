/** Lab experiments aligned with course catalogue */

export const LAB_COURSE_ALIGNMENT = {
  title: 'Lab × course learning paths',
  subtitle:
    'Gamified experiments map to IOAI and literacy syllabi. Play free without enrolling; full task sheets and mentor feedback unlock with course registration.',
  tracks: [
    {
      line: 'ioai',
      lineLabel: 'IOAI competition training',
      href: '/courses?line=ioai',
      pairs: [
        { labId: 'doodle-monsters', courseId: 'ioai-whitelist', note: 'Supervised learning · features & classification' },
        { labId: 'evolve-car', courseId: 'ioai-camp', note: 'Reinforcement learning · reward shaping' },
        { labId: 'jailbreak-adventure', courseId: 'ioai-mock', note: 'LLM safety · prompt attack & defence' },
      ],
    },
    {
      line: 'general',
      lineLabel: 'AI literacy (self-study)',
      href: '/courses?line=general',
      pairs: [
        { labId: 'hide-and-seek', courseId: 'g1', note: 'Computer vision basics' },
        { labId: 'word-gravity', courseId: 'g-lab-pack', note: 'Word embeddings & semantics' },
        { labId: 'virtual-conductor', courseId: 'g-literacy', note: 'Multimodal interaction' },
      ],
    },
    {
      line: 'k12',
      lineLabel: 'K12 classroom edition',
      href: '/courses?line=k12',
      pairs: [
        { labId: 'doodle-monsters', courseId: 'k-classroom', note: 'Class demo: classifier' },
        { labId: 'evolve-car', courseId: 'k3', note: 'Cloud lab sessions' },
      ],
    },
  ],
}
