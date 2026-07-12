/** Organization facts for /about — verifiable identity, not marketing slogans */

export const ABOUT_ORG = {
  version: '2026.1',
  updatedAt: '2026-03-01',
  displayName: 'Bingo Academy',
  legalName: 'Bingo Academy (operating entity: ScholarOne LLC, United States)',
  alsoKnownAs: 'Bingo AI Academy',
  region: {
    headquarters: 'United States',
    operations: 'United States, Singapore, and Greater China (school pilots & R&D partnerships)',
    timezoneNote: 'Support hours follow US Pacific and China Standard Time',
  },
  founded: {
    year: 2019,
    background:
      'Founded to deliver university-grade AI literacy and competition preparation for K–12 learners — bridging research-style lab documentation with age-appropriate pacing.',
  },
  mission:
    'Help students, families, and schools learn artificial intelligence through reproducible experiments, competition-ready portfolios, and evidence-based curriculum — not prompt-only demos.',
  audiences: [
    { label: 'Families', desc: 'Self-paced courses, free browser labs, and IOAI/USAAIO preparation' },
    { label: 'Competition teams', desc: 'Structured IOAI pathways, mock assessments, and defence coaching' },
    { label: 'K–12 schools', desc: 'Classroom editions, teacher training, procurement-ready privacy docs' },
  ],
  contact: {
    general: 'hello@bingoacademy.org',
    privacy: 'privacy@bingoacademy.org',
    schools: 'schools@bingoacademy.org',
    support: 'support@bingoacademy.org',
  },
  social: [
    { label: 'Website', href: 'https://www.bingoacademy.org', external: true },
    // Add verified social accounts here when published — do not invent handles
  ],
  verifyLinks: [
    { label: 'Core instructors', href: '/instructors' },
    { label: 'Teaching methodology', href: '/methodology' },
    { label: 'Outcomes & case studies', href: '/outcomes' },
    { label: 'Child safety & data use', href: '/safety-and-privacy' },
    { label: 'First-party evidence hub', href: '/guides/evidence' },
    { label: 'Certification verification', href: '/cert' },
  ],
}
