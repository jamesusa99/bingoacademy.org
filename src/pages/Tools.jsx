import { Link } from 'react-router-dom'

const tools = [
  { id: 'tool-1', title: 'Error Assistant AI', desc: 'Smart error log and personalized review', price: '$9.9/mo' },
  { id: 'tool-2', title: 'Homework Grader', desc: 'Auto grading and feedback', price: '$19.9/mo' },
  { id: 'tool-3', title: 'Speaking Practice', desc: 'AI speaking practice and assessment', price: '$29.9/mo' },
  { id: 'tool-4', title: 'Learning Report Generator', desc: 'Learning data visualization and reports', price: 'Free' },
]

export default function Tools() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">AI Tools</h1>
      <p className="text-slate-600 mb-8">Each tool has its own details and purchase page; purchases appear in Profile → My Orders</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((item) => (
          <Link key={item.id} to={`/tools/detail/${item.id}`} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <h3 className="font-semibold text-primary">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
            <p className="text-xs text-slate-500 mt-2">Price: {item.price}</p>
            <span className="text-sm text-primary mt-3 inline-block">View details →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
