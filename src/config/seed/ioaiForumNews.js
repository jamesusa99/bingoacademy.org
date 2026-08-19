/**
 * Curated IOAI news for community forum — sourced from ioai-official.org and verified press coverage.
 * Sync via: npm run seed:forum-ioai
 */

const BINGO_IOAI_TRAINING_REPLY = {
  content:
    'Families preparing for the next IOAI cycle can follow structured training on Bingo Academy — video modules, Jupyter labs, and mock assessments aligned to IOAI formats.\n\nhttps://www.bingoacademy.org/courses/ioai',
  author: 'Bingo Academy',
  avatar: '🎓',
}

/** @type {Array<{ title: string, content: string, author: string, avatar: string, category: string, publishedAt: string, sourceUrl: string, image?: string|null, replies?: Array<{ content: string, author: string, avatar: string, publishedAt?: string }> }>} */
export const IOAI_FORUM_THREADS = [
  {
    title: 'IOAI 2026 concludes in Astana — 108 countries, flag passes to Singapore',
    content: `The third International Olympiad in Artificial Intelligence (IOAI) closed on 8 August 2026 in Astana, Kazakhstan, after a week of competition, education, and international exchange.

Key figures:
• 108 participating countries and territories (131 accredited overall)
• 466 contestants · 126 teams · 200+ volunteers
• 42 delegations received financial support
• IOAI is now the second-largest international science olympiad by participation, after IMO

Competition highlights included a six-task Individual Contest (ML, computer vision, NLP, multimodal), a Team Challenge with Galbot on humanoid robots, GAITE for emerging olympiad nations, and the debut IOAI² AI Model Track.

The closing ceremony handed the IOAI flag to Singapore, host of IOAI 2027.

Source: https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/
Published: 8 August 2026`,
    author: 'IOAI News Desk',
    avatar: '🏆',
    category: 'Competition',
    publishedAt: '2026-08-08T18:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/',
    replies: [BINGO_IOAI_TRAINING_REPLY],
  },
  {
    title: 'Singapore confirmed as IOAI 2027 host at Astana closing ceremony',
    content: `At the IOAI 2026 closing ceremony in Astana, Kazakhstan formally passed hosting rights to Singapore for the fourth International Olympiad in Artificial Intelligence in 2027.

Singapore becomes the fourth host in IOAI's journey:
2024 Burgas, Bulgaria → 2025 Beijing, China → 2026 Astana, Kazakhstan → 2027 Singapore

The handover marks IOAI's rapid growth from 32 countries at the inaugural edition to 108 participating countries in 2026.

Source: https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/
Also reported: https://dknews.kz/en/articles-in-english/399907-singapore-to-host-international-ai-olympiad-in-2027
Published: 8 August 2026`,
    author: 'IOAI News Desk',
    avatar: '🏆',
    category: 'Competition',
    publishedAt: '2026-08-08T16:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/',
    replies: [],
  },
  {
    title: 'IOAI 2026 Individual Contest results — top 3 and medal table',
    content: `IOAI 2026 Individual Contest awards (Astana, 2–8 August 2026):

Top 3 overall:
1. Artem Gorokhov — Russia
2. Dauzhan Beketov — Kazakhstan
3. Shao Zixi — China

Medals awarded:
• 37 gold · 73 silver · 110 bronze · 62 honourable mentions

The individual round consisted of two six-hour sessions with six problems spanning machine learning, computer vision, NLP, and multimodal systems.

Team Challenge (humanoid robotics with Galbot): Poland 1st team won; Russia 1st team second; Poland 2nd team third.

Source: https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/
Coverage: https://tass.com/society/2170351 · https://jnews.az/en/results-of-the-iii-international-olympiad-in-artificial/
Published: 7–12 August 2026`,
    author: 'IOAI News Desk',
    avatar: '🏆',
    category: 'Competition',
    publishedAt: '2026-08-07T14:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/',
    replies: [],
  },
  {
    title: 'IOAI 2026 opens in Astana — third edition under UNESCO patronage',
    content: `The 3rd International Olympiad in Artificial Intelligence opened in Astana, Kazakhstan in August 2026, bringing together hundreds of contestants, team leaders, and observers from more than 100 countries.

IOAI 2026 ran under UNESCO patronage and included visits to Alem.ai (Kazakhstan's international AI centre), cultural programming, and academic sessions alongside the main contests.

Registered scale before the event exceeded 103 countries and territories (June 2026 update).

Source: https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/
Related: https://ioai-official.org/unesco-grants-patronage-to-ioai-2026/
Published: August 2026`,
    author: 'IOAI News Desk',
    avatar: '🏆',
    category: 'Competition',
    publishedAt: '2026-08-02T10:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/',
    replies: [],
  },
  {
    title: 'First IOAI² AI Model Track tests leading models on olympiad tasks',
    content: `IOAI 2026 introduced IOAI²: AI Model Track for the first time — putting leading AI models through the same olympiad tasks as human contestants.

The 2026 programme also featured:
• Individual Contest — 2 rounds, 3 tasks per round
• GAITE (Global AI Talent Empowerment) for countries newer to international science olympiads
• Team Challenge — cooperative AI solutions for humanoid robots (Galbot partnership)

Source: https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/
Published: 8 August 2026`,
    author: 'IOAI News Desk',
    avatar: '🤖',
    category: 'Resources',
    publishedAt: '2026-08-08T12:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/',
    replies: [],
  },
  {
    title: 'UNESCO grants patronage to IOAI 2026',
    content: `UNESCO granted official patronage to the third International Olympiad in Artificial Intelligence (IOAI 2026) in Astana, Kazakhstan.

The olympiad programme included activities on responsible AI development and cooperation with UNESCO–Uzbekistan Beruniy Prize laureates.

IOAI positions itself as a high-level academic competition for secondary school students, developed with experts from institutions including MIT, Oxford, University of Copenhagen, and MBZUAI.

Source: https://ioai-official.org/unesco-grants-patronage-to-ioai-2026/
Published: 20 April 2026`,
    author: 'IOAI News Desk',
    avatar: '🌐',
    category: 'Resources',
    publishedAt: '2026-04-20T09:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/unesco-grants-patronage-to-ioai-2026/',
    replies: [],
  },
  {
    title: 'IOAI 2025 concludes in Beijing — 63 countries, flag handover',
    content: `The second International Olympiad in Artificial Intelligence (IOAI 2025) concluded on 8 August 2025 in Beijing, China, at the Zhongguancun International Innovation Center.

IOAI 2025 brought together 310 students from 63 countries and territories, forming 80 teams — at the time the world's largest AI contest for high school students.

The event was hosted by Beijing National Day School (BNDS) with support from Beijing municipal education and science commissions. The closing ceremony included the official IOAI flag handover to the next host nation.

Source: https://ioai-official.org/2025-press-release-3/
Published: 8 August 2025`,
    author: 'IOAI News Desk',
    avatar: '🏆',
    category: 'Competition',
    publishedAt: '2025-08-08T18:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/2025-press-release-3/',
    replies: [BINGO_IOAI_TRAINING_REPLY],
  },
  {
    title: 'IOAI 2025 opens in Beijing — 2nd edition at Beijing National Day School',
    content: `IOAI 2025 officially opened on 4 August 2025 at Beijing National Day School, gathering global AI youth for competition, team challenges, and cultural exchange.

Scale: 310 students · 63 countries and territories · 80 teams.

IOAI was established on Bulgaria's initiative (first edition Burgas 2024) and developed with experts from MIT, Oxford, University of Copenhagen, and MBZUAI. The 2025 Beijing edition ran under UNESCO endorsement.

Source: https://ioai-official.org/2025-press-release-2/
Published: 4 August 2025`,
    author: 'IOAI News Desk',
    avatar: '🏆',
    category: 'Competition',
    publishedAt: '2025-08-04T10:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/2025-press-release-2/',
    replies: [],
  },
  {
    title: 'Inaugural IOAI 2024 held in Burgas, Bulgaria',
    content: `The first International Olympiad in Artificial Intelligence took place in Burgas, Bulgaria from 9–15 August 2024 — launching IOAI as the first high-level academic AI competition for secondary school students.

The inaugural edition hosted about 160 students from 35 countries. IOAI was endorsed by the President of Bulgaria and the Ministry of Education of Bulgaria.

Host journey since launch:
• 2024 — Burgas, Bulgaria (inaugural)
• 2025 — Beijing, China
• 2026 — Astana, Kazakhstan
• 2027 — Singapore (announced)

Source: https://ioai-official.org/bulgaria-2024/
Published: August 2024`,
    author: 'IOAI News Desk',
    avatar: '🏆',
    category: 'Competition',
    publishedAt: '2024-08-15T12:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/bulgaria-2024/',
    replies: [],
  },
  {
    title: 'IOAI 2026 registration surpasses 103 countries (June 2026)',
    content: `Ahead of the Astana finals, IOAI reported more than 103 registered countries and territories for IOAI 2026 — continuing rapid growth from 61 countries at IOAI 2025 and 35 at the 2024 inaugural edition.

IOAI community meetings in 2026 covered regional olympiads (including AOAI in Africa and Asia-Pacific pathways), volunteer coordination, and academic preparation.

Source: https://ioai-official.org/ioai-2026-reaches-103-registered-countries-and-territories/
Published: 1 June 2026`,
    author: 'IOAI News Desk',
    avatar: '📊',
    category: 'Resources',
    publishedAt: '2026-06-01T12:00:00.000Z',
    sourceUrl: 'https://ioai-official.org/ioai-2026-reaches-103-registered-countries-and-territories/',
    replies: [],
  },
]

/** Seed format — same shape as siteFallbacks FORUM_THREADS */
export const FORUM_THREADS = IOAI_FORUM_THREADS.map(({ publishedAt, sourceUrl, ...thread }) => thread)

/** Client fallback when Supabase is empty (Community.jsx) */
export function forumThreadsClientFallback() {
  return IOAI_FORUM_THREADS.map((thread, index) => ({
    id: `ioai-news-${index + 1}`,
    title: thread.title,
    content: thread.content,
    author: thread.author,
    avatar: thread.avatar,
    category: thread.category,
    image: thread.image ?? null,
    createdAt: new Date(thread.publishedAt).getTime(),
    replies: (thread.replies ?? []).map((reply, replyIndex) => ({
      id: `ioai-news-${index + 1}-r${replyIndex + 1}`,
      content: reply.content,
      author: reply.author,
      avatar: reply.avatar,
      image: null,
      createdAt: new Date(reply.publishedAt ?? thread.publishedAt).getTime() + (replyIndex + 1) * 3600000,
    })),
  }))
}
