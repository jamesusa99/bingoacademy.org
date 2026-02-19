import { Link, useParams } from 'react-router-dom'

const VENTURE_CASES = {
  1: { name: 'Alex Zhang', title: 'AI Learning Assistant Startup', content: 'This project uses LLMs and knowledge graphs to provide personalized error review and learning path recommendations for K-12 students. The team completed requirement analysis, data labeling, model fine-tuning, and basic frontend setup, delivering an MVP from 0 to 1 under mentor guidance.\n\nKey outcomes: Local dataset, Q&A module aligned with school curriculum, learning report dashboard. Project showcased at school tech festival and won Best Innovation Award.', images: ['https://placehold.co/800x450/0891b2/fff?text=Project'], video: null, links: [{ label: 'Demo', url: 'https://example.com/demo' }] },
  2: { name: 'Emma Li', title: 'Smart Picture Book Generator', content: 'Combines LLMs and drawing tools to generate personalized picture books for young children; supports parent-child co-creation.\n\nOutcomes: Story and illustration pipeline; piloted in reading classes at partner institutions.', images: ['https://placehold.co/800x450/0891b2/fff?text=Picture+Book'], video: null, links: [] },
  3: { name: 'Oliver Wang', title: 'Campus AI Q&A Bot', content: 'Q&A bot for common school questions (schedule, courses, events); integrated with campus official account and class groups.\n\nOutcomes: Deployed at multiple partner schools; ~200 queries/day.', images: [], video: null, links: [] },
  4: { name: 'Sophia Chen', title: 'AI + Environmental Data App', content: 'Image recognition and data analysis for campus waste sorting and stats; supports class competition and environmental practice.', images: ['https://placehold.co/800x450/0891b2/fff?text=Environmental'], video: null, links: [] },
  5: { name: 'Leo Liu', title: 'Personalized Learning Report Generator', content: 'Generates weekly/monthly reports and recommendations from learning data for parents and teachers.', images: [], video: null, links: [] },
}

const AWARD_CASES = {
  1: { name: 'James Zhao', title: 'National Youth AI Challenge 1st Prize', content: 'Entry on "AI + Environment": image recognition and data analysis for campus waste sorting. From topic, data collection, model training to deployment—full AI project workflow.\n\nJudge feedback: Clear problem definition, feasible solution, complete presentation. Also used for admissions evaluation and STEM specialty application.', images: ['https://placehold.co/800x450/0f172a/fff?text=1st+Prize'], video: null, links: [{ label: 'Event announcement', url: 'https://example.com/award' }] },
  2: { name: 'Lily Sun', title: 'Whitelist Event 2nd Prize', content: 'NLP-based subject Q&A and answer generation to support after-class practice and review.', images: [], video: null, links: [] },
  3: { name: 'Ethan Zhou', title: 'Provincial 1st Prize', content: 'Multimodal work: voice, image, and text combined in an intelligent learning assistant.', images: ['https://placehold.co/800x450/0f172a/fff?text=Provincial'], video: null, links: [] },
  4: { name: 'Mia Wu', title: 'Bingo Cup Grand Prize', content: 'Creativity and tech combined; full flow from idea to demo.', images: [], video: null, links: [] },
  5: { name: 'Ryan Zheng', title: 'International Event Winner', content: 'Represented school at international youth AI project showcase; recognized by international judges.', images: [], video: null, links: [] },
}

function CaseDetail({ type, id }) {
  const isVenture = type === 'venture'
  const casesMap = isVenture ? VENTURE_CASES : AWARD_CASES
  const caseData = casesMap[id] || (isVenture ? VENTURE_CASES[1] : AWARD_CASES[1])
  const caseTitle = caseData.title
  const caseSubtitle = isVenture ? `${caseData.name || ''} · Venture` : `Award case${caseData.name ? ` · ${caseData.name}` : ''}`
  const caseContent = caseData.content || ''
  const images = caseData.images || []
  const video = caseData.video
  const links = caseData.links || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← Back to Showcase</Link>
      </div>

      <header className="mb-8">
        <p className="text-sm text-slate-500 mb-1">{caseSubtitle}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark">{caseTitle}</h1>
      </header>

      <section className="mb-8">
        <h2 className="section-title mb-3">Overview</h2>
        <div className="card p-6 prose prose-slate max-w-none">
          <div className="whitespace-pre-line text-slate-700 leading-relaxed">{caseContent}</div>
        </div>
      </section>

      {images.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title mb-3">Images</h2>
          <div className="space-y-4">
            {images.map((src, i) => (
              <div key={i} className="card overflow-hidden p-0">
                <img src={src} alt="" className="w-full h-auto object-contain bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
      )}

      {video && (
        <section className="mb-8">
          <h2 className="section-title mb-3">Video</h2>
          <div className="card overflow-hidden p-0 aspect-video bg-slate-900">
            <video src={video} controls className="w-full h-full object-contain" />
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title mb-3">Links</h2>
          <ul className="space-y-2">
            {links.map((item, i) => (
              <li key={i}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {item.label} →
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pt-6 border-t">
        <Link to="/showcase" className="btn-primary">Back to Showcase</Link>
      </div>
    </div>
  )
}

export default function ShowcaseCasePage() {
  const { type, id } = useParams()
  return <CaseDetail type={type} id={id} />
}
