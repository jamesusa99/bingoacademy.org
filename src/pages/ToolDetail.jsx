import { Link, useParams } from 'react-router-dom'

const TOOLS = {
  'tool-1': {
    title: 'Error Assistant AI',
    desc: 'Smart error log and personalized review: auto-categorize errors, generate similar practice and explanations.',
    price: '$9.9/mo',
    poster: 'https://placehold.co/1200x600/0891b2/ffffff?text=Error+Assistant',
  },
  'tool-2': {
    title: 'Homework Grader',
    desc: 'Grading, feedback, and weak-point identification to improve teaching efficiency.',
    price: '$19.9/mo',
    poster: 'https://placehold.co/1200x600/0f172a/ffffff?text=Homework+Grader',
  },
  'tool-3': {
    title: 'Speaking Practice',
    desc: 'AI speaking practice and assessment: read-aloud scoring, conversation practice, reports.',
    price: '$29.9/mo',
    poster: 'https://placehold.co/1200x600/155e75/ffffff?text=Speaking+Practice',
  },
  'tool-4': {
    title: 'Learning Report Generator',
    desc: 'Learning data visualization and reports; parents/teachers can view progress.',
    price: 'Free',
    poster: 'https://placehold.co/1200x600/0e7490/ffffff?text=Learning+Report',
  },
}

export default function ToolDetail() {
  const { id } = useParams()
  const tool = TOOLS[id] || TOOLS['tool-1']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/tools" className="text-primary text-sm hover:underline">← Back to AI Tools</Link>
      </div>

      <div className="card overflow-hidden p-0 mb-6">
        <div className="aspect-[16/9] bg-slate-100">
          <img src={tool.poster} alt={tool.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark">{tool.title}</h1>
          <p className="text-slate-600 mt-2">{tool.desc}</p>
          <p className="text-primary font-semibold mt-3">Price: {tool.price}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="section-title mb-4">Purchase & Orders</h2>
        <div className="card p-6">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary text-sm px-4 py-2">Purchase Now</button>
            <button type="button" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">Add to My Orders</button>
            <Link to="/profile#orders" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">View My Orders</Link>
          </div>
          <p className="text-xs text-slate-500 mt-3">Placeholder—orders will appear in Profile → My Orders after payment integration.</p>
        </div>
      </section>
    </div>
  )
}
