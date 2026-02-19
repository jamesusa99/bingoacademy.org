import { Link, useParams } from 'react-router-dom'

const COURSES = {
  'basic-1': {
    name: 'Basic Course',
    stage: 'K7-K9',
    poster: 'https://placehold.co/1400x600/0891b2/ffffff?text=Basic+Course',
    teacher: 'Bingo Instructors',
    intro: 'Introduction to Python programming and essential AI theories, utilizing Google Colab tools to enhance computational thinking and problem-solving interest.',
    targetAudience: 'Students in grades 7 to 9, zero experience or minimal coding skills.',
    learningOutcomes: 'Understand the fundamentals of Python, explore how AI operates, and successfully complete basic data analysis and visualization projects.',
    outline: ['Python fundamentals', 'Essential AI theories', 'Google Colab tools', 'Data analysis and visualization projects'],
    trial: true,
    commission: '10%',
    price: '$890',
  },
  'intermediate-1': {
    name: 'Intermediate Course',
    stage: 'K9-K11',
    poster: 'https://placehold.co/1400x600/0e7490/ffffff?text=Intermediate+Course',
    teacher: 'Bingo Instructors',
    intro: 'Using NumPy/Pandas, and getting started with the PyTorch deep learning framework.',
    targetAudience: 'Students in grades 9-11 with a foundation in Python, looking to systematically learn core AI technologies.',
    learningOutcomes: 'Acquire a solid understanding of machine learning algorithms and the ability to independently carry out medium-complexity AI projects, including data cleansing, model training, and evaluation.',
    outline: ['NumPy/Pandas', 'PyTorch deep learning framework', 'Machine learning algorithms', 'Data cleansing, model training & evaluation'],
    trial: true,
    commission: '10%',
    price: '$990',
  },
  'advanced-1': {
    name: 'Advanced Course',
    stage: 'K10-K12',
    poster: 'https://placehold.co/1400x600/155e75/ffffff?text=Advanced+Course',
    teacher: 'Bingo Instructors',
    intro: 'Focus on cutting-edge models like Transformers, analyze classic competition problems, and enhance practical skills through real questions and mock contests.',
    targetAudience: 'Students in grades 10-12 with a solid foundation in AI programming, aiming to compete at a high level.',
    learningOutcomes: 'Understand core competition techniques and optimize models, accomplish high-level projects, and be well-prepared for contest readiness.',
    outline: ['Transformers and cutting-edge models', 'Classic competition problem analysis', 'Real questions & mock contests', 'Model optimization & contest readiness'],
    trial: true,
    commission: '12%',
    price: '$1290',
  },
  'literacy-1': {
    name: 'AI Literacy Introduction · Your First Step Toward the Future',
    poster: 'https://placehold.co/1400x600/0891b2/ffffff?text=AI+Literacy',
    teacher: 'Bingo Instructors',
    outline: ['AI literacy & meta-cognition', 'Proper AI tool use and boundaries', 'Creative practice: from idea to work', 'Portfolio & certification'],
    trial: true,
    commission: '10%',
    price: '$199',
  },
  'contest-1': {
    name: 'Whitelist Competition Bootcamp',
    poster: 'https://placehold.co/1400x600/0f172a/ffffff?text=Contest+Training',
    teacher: 'Competition Coaches',
    outline: ['Rules and judging criteria', 'Past papers and question-type breakdown', 'Mock exams and review', '1-on-1 tutoring and debrief'],
    trial: true,
    commission: '15%',
    price: '$1299',
  },
  'exam-1': {
    name: 'STEM Specialty Track Admissions Course',
    poster: 'https://placehold.co/1400x600/155e75/ffffff?text=Admissions',
    teacher: 'Admissions Advisors',
    outline: ['Path planning and timeline', 'Admissions materials coaching', 'Past papers and mock interviews', 'Portfolio and certificate planning'],
    trial: false,
    commission: '12%',
    price: '$1999',
  },
  'career-1': {
    name: 'AI Project Training · Career Placement',
    poster: 'https://placehold.co/1400x600/0e7490/ffffff?text=Career',
    teacher: 'Enterprise Mentors',
    outline: ['Job competency model', 'Project training and code review', 'Resume optimization and interview prep', 'Referrals and industry-education links'],
    trial: false,
    commission: '8%',
    price: '$2999',
  },
}

export default function CourseDetail() {
  const { id } = useParams()
  const course = COURSES[id] || COURSES['literacy-1']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/courses" className="text-primary text-sm hover:underline">← Back to AI Courses</Link>
      </div>

      <div className="card overflow-hidden p-0 mb-6">
        <div className="aspect-[16/9] bg-slate-100">
          <img src={course.poster} alt={course.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark">{course.name}</h1>
          {course.stage && <p className="text-slate-600 mt-1">Grades: {course.stage}</p>}
          <p className="text-slate-600 mt-1">Instructor: {course.teacher}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">Commission {course.commission}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-700">Price {course.price}</span>
            {course.trial && <span className="text-sm px-3 py-1 rounded-full bg-amber-50 text-amber-700">Trial available</span>}
          </div>
        </div>
      </div>

      {course.intro && (
        <section className="mb-8">
          <h2 className="section-title mb-4">Overview</h2>
          <div className="card p-6">
            <p className="text-slate-700">{course.intro}</p>
          </div>
        </section>
      )}

      {course.targetAudience && (
        <section className="mb-8">
          <h2 className="section-title mb-4">Target Audience</h2>
          <div className="card p-6">
            <p className="text-slate-700">{course.targetAudience}</p>
          </div>
        </section>
      )}

      {course.learningOutcomes && (
        <section className="mb-8">
          <h2 className="section-title mb-4">Learning Outcomes</h2>
          <div className="card p-6">
            <p className="text-slate-700">{course.learningOutcomes}</p>
          </div>
        </section>
      )}

      {course.outline && course.outline.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title mb-4">Syllabus</h2>
          <div className="card p-6">
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              {course.outline.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="section-title mb-4">Actions</h2>
        <div className="card p-6">
          <div className="flex flex-wrap gap-2">
            {course.trial && <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">Trial</button>}
            <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">Share (poster/link)</button>
            <Link to="/profile/study" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">Add to Study Center</Link>
            <button type="button" className="btn-primary text-sm px-4 py-2">Purchase Now</button>
          </div>
          <p className="text-xs text-slate-500 mt-3">WeChat Pay / Coupons / Group buy (coming soon)</p>
        </div>
      </section>
    </div>
  )
}
