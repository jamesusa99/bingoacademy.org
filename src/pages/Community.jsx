import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Certified Mentors data ────────────────────────────────────────
const CERTIFIED_MENTORS = [
  { name: 'James Chen', title: 'Professor · UESTC', photo: '/mentors/jianwen-chen.jpg', tag: 'AI Research', intro: 'Over 20 years of research in video processing and AI algorithms; multimodal feature fusion for affective computing. Professor & doctoral supervisor at UESTC; Director of Visual Intelligence Research Center.', awards: '200+ papers · National research grants' },
  { name: 'Wenyi Wang', title: 'Ph.D · Associate Professor', photo: '/mentors/wenyi-wang.jpg', tag: 'Data Mining & AI', intro: 'AI expert at UESTC. Research spans data mining, AI, and algorithm optimisation. M.Sc. and Ph.D. from University of Ottawa, Canada.', awards: 'Best-paper awards · Industry AI advisory' },
  { name: 'Michell Xu', title: 'Ph.D · AI Scientist', photo: '/mentors/feng-xu.jpg', tag: 'Computer Vision', intro: 'Researcher at Beijing Academy of AI; Beijing High-Level Overseas Talent. Former researcher at Samsung Research America and Thomson. Postdoctoral fellow at UPenn; Ph.D. from Tsinghua University.', awards: '50+ international patents · Samsung innovation awards' },
  { name: 'Shuang Wang', title: 'Ph.D · AI Scientist', photo: '/mentors/shuang-wang.jpg', tag: 'LLM & Deep Learning', intro: 'Co-founder of Lava Education and ScholarOne LLC (USA). US AI sensor network patent holder. Specialises in LLMs, multimodal intelligence, deep learning. Ph.D. from University of Missouri.', awards: 'US patent holder · International competition mentor' },
]

// ─── Elite Coaches ────────────────────────────────────────────────
const ELITE_COACHES = [
  { name: 'Coach Lin', role: 'National AI Competition Gold Coach', stat: '500+ award winners coached', avatar: '🏆', type: 'competition' },
  { name: 'Dr. Zhang', role: 'STEM Admissions Specialist', stat: '300+ STEM specialty admits', avatar: '🎓', type: 'admissions' },
  { name: 'Ms. Liu', role: 'AI Project Mentor · Tsinghua PhD', stat: '100+ published student projects', avatar: '🔬', type: 'research' },
  { name: 'Prof. Wang', role: 'AI Ethics & Thinking Expert', stat: '15 yrs youth AI education', avatar: '🧠', type: 'research' },
]

// ─── Star Student Tiers ───────────────────────────────────────────
const STAR_TIERS = [
  { id: 'pioneer', label: 'Pioneer Scholar', age: 'Ages 6–9', desc: 'Elementary starters', focus: 'Attendance + daily check-in consistency', pts: 100, color: 'bg-green-100 text-green-700 border-green-200', icon: '🌱' },
  { id: 'rising', label: 'Rising Scholar', age: 'Ages 10–14', desc: 'Intermediate track', focus: 'Course mastery + practical skills + check-in quality', pts: 300, color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📈' },
  { id: 'elite', label: 'Elite Scholar', age: 'Ages 14–18', desc: 'Competition track', focus: 'Course outcomes + competition participation + research projects', pts: 600, color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🏆' },
  { id: 'super', label: 'Bingo Super Scholar', age: 'All ages', desc: 'Highest honour', focus: 'Comprehensive ability + core achievements + role model impact', pts: 1000, color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⭐' },
]

// ─── Star Student examples ────────────────────────────────────────
const STAR_STUDENTS = [
  { name: 'Alex W.', grade: 'Grade 11', tier: 'super', achievement: 'National AI Innovation Competition · First Place', path: 'Foundations → Competition Bootcamp → Science Camp → Super Scholar', avatar: '⭐', pts: 1240 },
  { name: 'Mia C.', grade: 'Grade 10', tier: 'elite', achievement: 'STEM Specialty Admissions · Top Provincial School', path: 'Level 1 → Level 2 → STEM Admissions Track', avatar: '🏆', pts: 820 },
  { name: 'Kevin L.', grade: 'University Yr 1', tier: 'super', achievement: 'AI startup incubated · $30K seed funding', path: 'Level 3 Applied → Level 4 → Super Scholar', avatar: '⭐', pts: 1580 },
  { name: 'Emma T.', grade: 'Grade 7', tier: 'rising', achievement: 'Regional AI Creativity Award', path: 'Foundations → Intermediate Track', avatar: '📈', pts: 410 },
  { name: 'Jason H.', grade: 'Grade 9', tier: 'elite', achievement: '2nd place · City-level AI Robot Competition', path: 'Intermediate → Competition Bootcamp', avatar: '🏆', pts: 690 },
  { name: 'Lily Z.', grade: 'Grade 4', tier: 'pioneer', achievement: 'School AI Art Exhibition – Best Work', path: 'AI Foundations Course', avatar: '🌱', pts: 175 },
]

// ─── Check-in tasks ───────────────────────────────────────────────
const CHECKIN_TASKS = [
  { id: 't1', type: 'study', icon: '📖', title: 'Daily Study Check-In', desc: 'Complete a lesson and mark attendance', pts: 5, scholarPts: 1, done: false },
  { id: 't2', type: 'practice', icon: '🛠️', title: 'Practice Project Upload', desc: 'Submit your AI practice work screenshot', pts: 20, scholarPts: 3, done: false },
  { id: 't3', type: 'share', icon: '📢', title: 'Community Share Check-In', desc: 'Share today\'s learning insight in the group', pts: 10, scholarPts: 2, done: false },
  { id: 't4', type: 'scholar', icon: '⭐', title: 'Scholar Bonus Task', desc: 'Complete the week\'s project challenge', pts: 50, scholarPts: 10, done: false, exclusive: true },
]

const CHECKIN_REWARDS = [
  { icon: '🎫', title: 'Course Voucher', pts: 200, desc: 'Up to $50 off any course', stock: 'Available' },
  { icon: '📦', title: 'AI Maker Kit', pts: 500, desc: 'Hardware kit for AI projects', stock: '12 left' },
  { icon: '👨‍🏫', title: '1-on-1 Mentor Session', pts: 800, desc: '30-min elite mentor consultation', stock: 'Available' },
  { icon: '🏅', title: 'Competition Entry Fee', pts: 1000, desc: 'Free entry to partner competition', stock: '5 left' },
  { icon: '📜', title: 'Scholar Certificate Frame', pts: 300, desc: 'Premium frame for your certificate', stock: 'Scholar only', scholarOnly: true },
  { icon: '🎖️', title: 'Scholar Digital Badge', pts: 150, desc: 'Exclusive digital profile badge', stock: 'Scholar only', scholarOnly: true },
]

// ─── Partner Institutions ─────────────────────────────────────────
const PARTNERS = [
  { name: 'Youth STEM Education Center', region: 'Jiangsu · Nanjing', type: 'University Lab' },
  { name: 'AI Education Practice Base', region: 'Guangdong · Shenzhen', type: 'Practice Base' },
  { name: 'Education Group STEM Academy', region: 'Beijing', type: 'STEM Academy' },
  { name: 'Foreign Language School AI Lab', region: 'Shanghai', type: 'School Lab' },
  { name: 'STEM Training Academy', region: 'Zhejiang · Hangzhou', type: 'Training Org' },
  { name: 'Maker Education Institute', region: 'Sichuan · Chengdu', type: 'Maker Space' },
]

// ─── Forum: seed threads (BBS-style) ───────────────────────────────
const FORUM_STORAGE_KEY = 'bingo-forum-threads'
const SAMPLE_THREADS = [
  { id: 't1', title: 'Best age to start AI education?', content: 'Hi everyone! I have a 7-year-old and wondering when is the ideal time to introduce AI concepts. Would love to hear from parents who started early.', author: 'Parent_Mia', avatar: '👩', category: 'Discussion', createdAt: Date.now() - 86400000 * 2, replies: [
    { id: 'r1', content: 'We started at 8 with visual programming. Found it perfect — not too early, kid was ready for logical thinking.', author: 'Dad_Leo', avatar: '👨', createdAt: Date.now() - 86400000 * 1.8 },
    { id: 'r2', content: 'Agree! Also check Bingo\'s AI Foundations course — my daughter loved the project-based approach.', author: 'Mom_Sarah', avatar: '👩', createdAt: Date.now() - 86400000 * 1.5 },
  ]},
  { id: 't2', title: 'Our competition journey: from zero to provincial award', content: 'Sharing our 10-month path. Started with Python basics, joined AI Innovation Camp, then competition sprint. Key: consistent practice + mentor guidance. Happy to answer questions!', author: 'Parent_David', avatar: '👨', category: 'Parent Experience', image: null, createdAt: Date.now() - 86400000 * 5, replies: [
    { id: 'r3', content: 'Congratulations! How many hours per week did your child dedicate?', author: 'Curious_Parent', avatar: '🙋', createdAt: Date.now() - 86400000 * 4.8 },
    { id: 'r4', content: 'About 5–7 hrs including weekend project time. Quality over quantity mattered most.', author: 'Parent_David', avatar: '👨', createdAt: Date.now() - 86400000 * 4.5 },
  ]},
  { id: 't3', title: 'Competition registration tips 2024', content: 'Compiled a quick guide from our experience: 1) Check prestigious competition deadlines early 2) Prepare project documentation 3) Mock defence practice helps. Add your tips below!', author: 'Coach_Lin_Fan', avatar: '🏆', category: 'Competition', createdAt: Date.now() - 86400000 * 1, replies: [] },
]

function loadForumThreads() {
  try {
    const raw = localStorage.getItem(FORUM_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(SAMPLE_THREADS))
}

function saveForumThreads(threads) {
  try { localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(threads)) } catch (_) {}
}

// ─── Forum Section (BBS-style) ─────────────────────────────────────
function ForumSection() {
  const [threads, setThreads] = useState(() => loadForumThreads())
  const [view, setView] = useState('list') // 'list' | 'thread' | 'new'
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '', author: 'Guest', category: 'Discussion' })
  const [replyText, setReplyText] = useState('')
  const [replyAuthor, setReplyAuthor] = useState('Guest')
  const [replyImageUrl, setReplyImageUrl] = useState('')

  const activeThread = threads.find(t => t.id === activeThreadId)

  const handleCreatePost = () => {
    if (!newPost.title.trim()) return
    const thread = {
      id: 't' + Date.now(),
      title: newPost.title.trim(),
      content: newPost.content.trim() || '(No content)',
      author: newPost.author.trim() || 'Anonymous',
      avatar: '✍️',
      category: newPost.category,
      image: newPost.imageUrl.trim() || null,
      createdAt: Date.now(),
      replies: [],
    }
    setThreads(prev => [thread, ...prev])
    saveForumThreads([thread, ...threads])
    setNewPost({ title: '', content: '', imageUrl: '', author: 'Guest', category: 'Discussion' })
    setView('list')
  }

  const handleReply = () => {
    if ((!replyText.trim() && !replyImageUrl.trim()) || !activeThreadId) return
    const reply = {
      id: 'r' + Date.now(),
      content: replyText.trim() || '(Image)',
      author: replyAuthor.trim() || 'Anonymous',
      avatar: '💬',
      image: replyImageUrl.trim() || null,
      createdAt: Date.now(),
    }
    const updated = threads.map(t => t.id === activeThreadId
      ? { ...t, replies: [...(t.replies || []), reply] }
      : t)
    setThreads(updated)
    saveForumThreads(updated)
    setReplyText('')
    setReplyImageUrl('')
    setActiveThreadId(activeThreadId)
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    const now = Date.now()
    const diff = now - ts
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago'
    return d.toLocaleDateString()
  }

  if (view === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="text-sm text-primary hover:underline flex items-center gap-1">← Back to forum</button>
          <h2 className="font-bold text-bingo-dark">Create new post</h2>
        </div>
        <div className="card p-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Your name / nickname</label>
              <input value={newPost.author} onChange={e => setNewPost(p => ({ ...p, author: e.target.value }))}
                placeholder="e.g. Parent_Mia" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Category</label>
              <select value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
                {['Discussion', 'Parent Experience', 'Competition', 'Course Q&A', 'Resources', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Title *</label>
              <input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                placeholder="Post title" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Content</label>
              <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                rows={5} placeholder="Share your thoughts, questions, or experiences..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Image URL (optional)</label>
              <input value={newPost.imageUrl} onChange={e => setNewPost(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreatePost} className="btn-primary px-6 py-2.5">Publish post</button>
              <button onClick={() => setView('list')} className="border border-slate-200 rounded-xl px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'thread' && activeThread) {
    return (
      <div className="space-y-6">
        <button onClick={() => { setView('list'); setActiveThreadId(null) }} className="text-sm text-primary hover:underline flex items-center gap-1">← Back to forum</button>
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">{activeThread.avatar || '📝'}</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{activeThread.category}</span>
              <h2 className="font-bold text-bingo-dark mt-2 mb-1">{activeThread.title}</h2>
              <p className="text-xs text-slate-500 mb-3">{activeThread.author} · {formatTime(activeThread.createdAt)}</p>
              <p className="text-slate-700 text-sm whitespace-pre-wrap">{activeThread.content}</p>
              {activeThread.image && (
                <img src={activeThread.image} alt="" className="mt-3 max-w-full rounded-xl border border-slate-200 max-h-64 object-contain" onError={e => e.target.style.display = 'none'} />
              )}
            </div>
          </div>
        </div>
        {(activeThread.replies || []).map(r => (
          <div key={r.id} className="card p-4 pl-6 border-l-4 border-primary/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0">{r.avatar || '💬'}</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-600 mb-1">{r.author} · {formatTime(r.createdAt)}</p>
                {r.content && r.content !== '(Image)' && <p className="text-slate-700 text-sm whitespace-pre-wrap">{r.content}</p>}
                {r.image && <img src={r.image} alt="" className="mt-2 max-w-full rounded-lg border border-slate-200 max-h-48 object-contain" onError={e => e.target.style.display = 'none'} />}
              </div>
            </div>
          </div>
        ))}
        <div className="card p-5 bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-bingo-dark mb-3">Add a reply</h3>
          <div className="space-y-3">
            <input value={replyAuthor} onChange={e => setReplyAuthor(e.target.value)} placeholder="Your name"
              className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Write your reply..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none" />
            <input value={replyImageUrl} onChange={e => setReplyImageUrl(e.target.value)} placeholder="Image URL (optional)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button onClick={handleReply} className="btn-primary px-5 py-2" disabled={!replyText.trim() && !replyImageUrl.trim()}>Post reply</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-bingo-dark mb-1">AI-Spark Forum — Discuss & share</h2>
          <p className="text-slate-500 text-sm">Post topics, share experiences, ask questions. Everyone can reply and join the discussion.</p>
        </div>
        <button onClick={() => setView('new')} className="btn-primary px-5 py-2.5 shrink-0">✏️ New post</button>
      </div>
      <div className="space-y-2">
        {threads.map(t => (
          <div key={t.id} onClick={() => { setActiveThreadId(t.id); setView('thread') }}
            className="card p-4 flex flex-wrap items-center gap-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0">{t.avatar || '📝'}</div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">{t.category}</span>
              <h3 className="font-semibold text-bingo-dark text-sm mt-1 truncate">{t.title}</h3>
              <p className="text-xs text-slate-500">{t.author} · {formatTime(t.createdAt)} · {(t.replies || []).length} replies</p>
            </div>
            <span className="text-slate-400 text-xs">→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Certified Courses ────────────────────────────────────────────
const CERT_COURSES = [
  { name: 'AI Literacy Certification', age: 'Ages 6–10', cert: 'Foundation Certificate', scholarPts: '+50 Scholar pts', partnerCert: true },
  { name: 'AI & Robotics Certification', age: 'Ages 10–14', cert: 'Applied Certificate', scholarPts: '+80 Scholar pts', partnerCert: true },
  { name: 'Data Science Certification', age: 'Ages 12–18', cert: 'Advanced Certificate', scholarPts: '+120 Scholar pts', partnerCert: true },
  { name: 'Machine Learning Foundations', age: 'Ages 14–18', cert: 'Expert Certificate', scholarPts: '+150 Scholar pts', partnerCert: true },
]

// ─── Avatar component ─────────────────────────────────────────────
function Avatar({ src, name, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const sz = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'
  return (
    <div className={`shrink-0 ${sz} rounded-full overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-slate-500`}>
      {!failed ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setFailed(true)} /> : null}
      {(failed || !src) && <span className="text-lg">{name?.charAt(0)}</span>}
    </div>
  )
}

// ─── Scholar Registration Modal ───────────────────────────────────
function ScholarModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', age: '', cohort: '', tier: '' })
  if (step === 2) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-lg font-bold text-bingo-dark mb-1">Application Received!</h3>
        <p className="text-slate-600 text-sm mb-2">Your personalised Scholar check-in plan has been generated and sent to your account.</p>
        <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 mb-4">Next evaluation: <strong>end of this month</strong>. Keep checking in daily!</div>
        <button onClick={onClose} className="btn-primary w-full py-2.5">Start Check-In Journey →</button>
      </div>
    </div>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark">Apply for Scholar Programme</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="space-y-3 mb-5">
          {[['name','Student Name','Full name'],['age','Age','e.g. 12'],['cohort','Current Course / Cohort','e.g. Intermediate Track']].map(([k,l,p]) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{l} *</label>
              <input required value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} placeholder={p}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Target Scholar Tier *</label>
            <select value={form.tier} onChange={e => setForm(f => ({...f, tier: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none bg-white">
              <option value="">Select tier</option>
              {STAR_TIERS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label} ({t.age})</option>)}
            </select>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 mb-4">
          <strong>Key rules:</strong> Complete course requirements · Reach points threshold · Quality check-ins. Evaluated monthly (Super Scholar: quarterly).
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep(2)} className="btn-primary flex-1 py-2.5">Submit Application</button>
          <button onClick={onClose} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Scholar Progress Modal ───────────────────────────────────────
function ProgressModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const search = () => setResult({ name: query || 'Sample Student', pts: 380, scholarPts: 42, rank: 7, checkinRate: '82%', target: 'Elite Scholar', gap: 220 })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark">Scholar Progress Query</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter student name or ID"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none mb-3" />
        <button onClick={search} className="w-full btn-primary py-2.5 mb-4">Query Progress</button>
        {result && (
          <div className="space-y-2 text-sm">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="font-semibold text-bingo-dark mb-2">{result.name}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['Check-in Points', result.pts], ['Scholar Points', result.scholarPts], ['Current Rank', `#${result.rank}`], ['Check-in Rate', result.checkinRate]].map(([l,v]) => (
                  <div key={l} className="bg-white rounded-lg p-2 text-center"><div className="font-bold text-primary">{v}</div><div className="text-slate-500">{l}</div></div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
              Target: <strong>{result.target}</strong> · Still need <strong>{result.gap} pts</strong>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 btn-primary text-xs py-2">Go Check In →</button>
              <button onClick={onClose} className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Lead capture Modal ───────────────────────────────────────────
function LeadModal({ title, onClose }) {
  const [done, setDone] = useState(false)
  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-2">✅</div>
        <p className="font-semibold text-bingo-dark mb-1">Request Received!</p>
        <p className="text-slate-500 text-sm mb-4">We'll reach you within 24 hours.</p>
        <Link to="/ai-test" onClick={onClose} className="btn-primary text-sm px-5 py-2">Take Free AI Assessment →</Link>
      </div>
    </div>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark text-sm">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="space-y-3 mb-4">
          {['Name','Age','Phone / Email'].map(f => <input key={f} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />)}
        </div>
        <button onClick={() => setDone(true)} className="w-full btn-primary py-2.5">Submit — Get My Plan</button>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function Community() {
  const [tab, setTab] = useState('home')
  const [scholarModal, setScholarModal] = useState(false)
  const [progressModal, setProgressModal] = useState(false)
  const [leadModal, setLeadModal] = useState(null)
  const [checkedIn, setCheckedIn] = useState({})
  const [joinDone, setJoinDone] = useState(false)
  const [redeemed, setRedeemed] = useState({})

  const NAV_TABS = [
    { id: 'home', icon: '🏠', label: 'Community Home' },
    { id: 'scholars', icon: '⭐', label: 'AI Star Scholars', highlight: true },
    { id: 'mentors', icon: '🏆', label: 'Elite Mentor Hub' },
    { id: 'checkin', icon: '📅', label: 'Check-In & Points' },
    { id: 'courses', icon: '📜', label: 'Certified Courses' },
    { id: 'partners', icon: '🏫', label: 'Partner Institutions' },
    { id: 'forum', icon: '💬', label: 'AI-Spark Forum' },
  ]

  const doCheckin = (id) => setCheckedIn(p => ({ ...p, [id]: true }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Modals */}
      {scholarModal && <ScholarModal onClose={() => setScholarModal(false)} />}
      {progressModal && <ProgressModal onClose={() => setProgressModal(false)} />}
      {leadModal && <LeadModal title={leadModal} onClose={() => setLeadModal(null)} />}

      {/* ── Hero Banner ── */}
      <section className="mb-8 section-tech rounded-2xl px-6 py-10 text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">AI Empowers Growth · Innovation Lights the Way</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mb-3">Bingo AI Learning Community</h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto mb-4">
          Expert mentors · peer scholars · reward-driven check-ins · authoritative certificates.<br className="hidden sm:block" />
          Your complete AI learning ecosystem — structured, social, and results-focused.
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs mb-6">
          {['University-affiliated mentors','Competition & admissions guidance','Certified course programmes','Daily check-in point system','Bingo AI Scholar Honours','AI-Spark Forum'].map((t,i) => (
            <span key={i} className="bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 text-slate-700">{t}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {joinDone
            ? <span className="btn-primary px-6 py-2.5">✅ Welcome to the community!</span>
            : <button onClick={() => setJoinDone(true)} className="btn-primary px-6 py-2.5">Join Free Now</button>}
          <button onClick={() => setScholarModal(true)} className="px-6 py-2.5 rounded-xl border border-amber-400 text-amber-700 font-medium hover:bg-amber-50 transition text-sm">⭐ View Scholar Honours</button>
          <button onClick={() => setLeadModal('Book a Free 1-on-1 Learning Plan')} className="px-6 py-2.5 rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition text-sm">Get Free Learning Plan</button>
        </div>
        <p className="text-xs text-slate-400 mt-4">Backed by the Bingo AI Education Research Team · 10,000+ students served</p>
      </section>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[['10,000+','Students Served'],['92%','Competition Award Rate'],['300+','International Awards'],['500+','Partner Institutions']].map(([v,l],i) => (
          <div key={i} className="card p-4 text-center">
            <div className="text-xl font-bold text-primary">{v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Nav ── */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
        {NAV_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5
              ${tab === t.id ? (t.highlight ? 'bg-amber-500 text-white shadow' : 'bg-primary text-white shadow') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              ${t.highlight && tab !== t.id ? 'border border-amber-300' : ''}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: COMMUNITY HOME
      ══════════════════════════════════════════ */}
      {tab === 'home' && (
        <div className="space-y-8">
          {/* Three pillars */}
          <section>
            <h2 className="section-title mb-5">Three Systems That Make Learning Stick</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '🏆', color: 'border-primary/20', btnColor: 'btn-primary', tabTarget: 'mentors', title: 'Elite Mentor Hub', pain: 'No direction · no one to ask', value: 'AI competition gold coaches, STEM admissions advisors, and university professors. 1-on-1 Q&A, personalised learning plans, assignment reviews. Help your student avoid 2 years of wasted effort.', stat: '15+ certified elite mentors' },
                { icon: '⭐', color: 'border-amber-200/60 bg-amber-50/20', btnColor: 'bg-amber-500 text-white hover:bg-amber-600', tabTarget: 'scholars', title: 'AI Star Scholar System', pain: 'No role models · no visible progress', value: 'A four-tier honours programme: Pioneer → Rising → Elite → Super Scholar. Real student cases with documented paths. Every success story is replicable.', stat: '89% of scholars won provincial+ awards' },
                { icon: '📅', color: 'border-green-200/60 bg-green-50/20', btnColor: 'bg-green-600 text-white hover:bg-green-700', tabTarget: 'checkin', title: 'Check-In & Points', pain: 'Can\'t stay consistent · no motivation', value: 'Gamified daily check-ins earn points redeemable for course vouchers, hardware kits, mentor sessions, and competition entries. Scholar points run a parallel track.', stat: '78% daily check-in rate · 1M+ pts distributed' },
              ].map((p,i) => (
                <div key={i} className={`card p-6 flex flex-col border-2 ${p.color}`}>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-2xl mb-3 shadow-sm">{p.icon}</div>
                  <h3 className="font-bold text-bingo-dark mb-1">{p.title}</h3>
                  <p className="text-xs text-primary font-medium mb-2">Solves: {p.pain}</p>
                  <p className="text-sm text-slate-600 flex-1 mb-3">{p.value}</p>
                  <p className="text-xs text-slate-400 mb-3">✓ {p.stat}</p>
                  <button onClick={() => setTab(p.tabTarget)} className={`w-full text-sm py-2 rounded-xl font-medium transition ${p.btnColor}`}>
                    Enter {p.title} →
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Anxiety solver */}
          <section className="card p-6 border-primary/10">
            <h2 className="text-base font-bold text-bingo-dark mb-5 text-center">Every AI Learning Anxiety — One Community Solves All</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🗺️', pain: '"No direction"', fix: 'Structured learning paths + 1-on-1 mentor planning — zero guesswork, no wasted time' },
                { icon: '💬', pain: '"No one to ask"', fix: 'Elite mentor live Q&A + peer community — questions answered the same day' },
                { icon: '🔥', pain: '"Can\'t stay consistent"', fix: 'Gamified check-ins + Scholar honours + peer accountability — motivation built in' },
                { icon: '🏅', pain: '"No visible results"', fix: 'Competition access + project showcase + Scholar certificates + college admissions support' },
              ].map((s,i) => (
                <div key={i} className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-2">{s.pain}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.fix}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 mb-3">Powered by the <strong>Bingo AI Education Research Team</strong> — Tsinghua / Beihang AI faculty + 10+ years youth education · All outcomes verified</p>
              <button onClick={() => setLeadModal('Get a Free Personalised AI Learning Plan')} className="btn-primary text-sm px-5 py-2">Get a Free Personalised Learning Plan →</button>
            </div>
          </section>

          {/* Results carousel */}
          <section>
            <h2 className="section-title mb-4">Recent Scholar Achievements</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {STAR_STUDENTS.slice(0,3).map((s,i) => (
                <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">{s.avatar}</div>
                    <div><div className="font-semibold text-bingo-dark text-sm">{s.name}</div><div className="text-xs text-slate-500">{s.grade}</div></div>
                  </div>
                  <p className="text-xs text-slate-700 mb-2">🏅 {s.achievement}</p>
                  <button onClick={() => setTab('scholars')} className="text-xs text-primary hover:underline">View full story →</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: AI STAR SCHOLARS
      ══════════════════════════════════════════ */}
      {tab === 'scholars' && (
        <div className="space-y-8">
          {/* Hero */}
          <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-bingo-dark mb-1">⭐ Bingo AI Star Scholar Programme</h2>
                <p className="text-slate-600 text-sm max-w-xl">A structured honours system that turns consistent effort into recognised achievement. Four tiers, transparent rules, real rewards — giving every student a clear target and the recognition they deserve.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setScholarModal(true)} className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-600 transition">Apply for Scholar →</button>
                <button onClick={() => setProgressModal(true)} className="border border-amber-400 text-amber-700 px-5 py-2 rounded-xl text-sm hover:bg-amber-50 transition">Check My Progress</button>
              </div>
            </div>
          </div>

          {/* Tiers */}
          <section>
            <h3 className="font-semibold text-bingo-dark mb-4">Scholar Tiers</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STAR_TIERS.map(t => (
                <div key={t.id} className={`card p-5 border-2 ${t.color}`}>
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="font-bold text-bingo-dark">{t.label}</div>
                  <div className="text-xs text-slate-500 mb-2">{t.age} · {t.desc}</div>
                  <p className="text-xs text-slate-600 mb-3">{t.focus}</p>
                  <div className="text-xs font-semibold text-primary">Threshold: {t.pts} Scholar pts</div>
                  {t.id === 'super' && <div className="text-[10px] text-amber-600 mt-1 bg-amber-50 rounded px-1.5 py-0.5">Highest honour · Direct entry to Mentor Hub</div>}
                </div>
              ))}
            </div>
          </section>

          {/* Evaluation rules */}
          <section className="card p-6 border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-bingo-dark mb-4">How to Become a Scholar — Transparent Rules</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
              {[
                ['✅ Basic Requirement', 'Complete course requirements for your level with no unexcused absences'],
                ['📅 Check-In Threshold', 'Reach the Scholar points threshold for your target tier through quality check-ins'],
                ['🎖️ Bonus Points', 'Earn extra points via community posts, mentor Q&A participation, competitions, or research projects'],
                ['📆 Evaluation Cycle', 'Monthly evaluation (Pioneer/Rising/Elite) · Quarterly evaluation (Super Scholar)'],
                ['📢 Public Announcement', '3-day public notice after evaluation. Results posted with name, cohort, and key achievement'],
                ['🔄 Appeals', 'Reasonable feedback accepted during the public notice period'],
              ].map(([t,d],i) => (
                <div key={i} className="bg-white rounded-xl p-3 flex gap-2">
                  <span className="shrink-0 font-medium text-slate-800 text-xs">{t}</span>
                  <span className="text-xs">{d}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Scholar Honours & Benefits */}
          <section>
            <h3 className="font-semibold text-bingo-dark mb-4">Scholar Honours & Benefits</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '📜', title: 'Scholar Certificate', desc: 'Digital + printed certificate. Super Scholar certs are jointly certified by partner institutions.' },
                { icon: '🎖️', title: 'Scholar Badge', desc: 'Displayed on your profile and community page. Super Scholar badge unlocks Mentor Hub entry.' },
                { icon: '📚', title: 'Course Rewards', desc: 'Redeem for premium courses, study materials, and AI maker kits. Super Scholar gets free Science Camp.' },
                { icon: '🌟', title: 'Mentor Access', desc: '1-on-1 competition guidance for Elite+ scholars. Super Scholars join the Mentor Hub as featured members.' },
              ].map((b,i) => (
                <div key={i} className="card p-5 text-center hover:shadow-md transition">
                  <div className="text-2xl mb-2">{b.icon}</div>
                  <div className="font-semibold text-bingo-dark text-sm mb-1">{b.title}</div>
                  <p className="text-xs text-slate-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Leaderboard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-bingo-dark">Monthly Scholar Leaderboard</h3>
              <button onClick={() => setProgressModal(true)} className="text-xs text-primary hover:underline">Check my ranking →</button>
            </div>
            <div className="space-y-2">
              {STAR_STUDENTS.sort((a,b) => b.pts - a.pts).map((s,i) => {
                const tier = STAR_TIERS.find(t => t.id === s.tier)
                return (
                  <div key={i} className={`card p-4 flex items-center gap-4 hover:shadow-sm transition ${i < 3 ? 'border-amber-200/60' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>{i+1}</div>
                    <div className="text-2xl">{s.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-bingo-dark text-sm">{s.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tier?.color}`}>{tier?.label}</span>
                      </div>
                      <div className="text-xs text-slate-500">{s.grade} · {s.achievement}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary text-sm">{s.pts}</div>
                      <div className="text-[10px] text-slate-400">Scholar pts</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <div className="card p-5 bg-amber-50 border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-bingo-dark">Ready to earn your Scholar title?</p>
              <p className="text-xs text-slate-500 mt-0.5">Take the free AI assessment to get matched to the right tier and learning path</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setScholarModal(true)} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-amber-600 transition">Apply Now →</button>
              <Link to="/ai-test" className="border border-amber-400 text-amber-700 text-sm px-4 py-2 rounded-xl hover:bg-amber-50 transition">Free Assessment</Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: ELITE MENTOR HUB
      ══════════════════════════════════════════ */}
      {tab === 'mentors' && (
        <div className="space-y-8">
          <div className="card p-5 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">🏆 Bingo Elite Mentor Hub</h2>
            <p className="text-slate-600 text-sm">Competition coaches, STEM admissions advisors, and research professors — all accessible through the community. 1-on-1 Q&A, personalised plans, and assignment feedback. Help your student save 2 years of wrong turns.</p>
          </div>

          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Competition & Admissions Coaches</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ELITE_COACHES.map((m,i) => (
                <div key={i} className="card p-5 text-center hover:shadow-md hover:border-primary/30 transition">
                  <div className="text-3xl mb-2">{m.avatar}</div>
                  <div className="font-semibold text-bingo-dark text-sm">{m.name}</div>
                  <div className="text-xs text-primary mt-0.5">{m.role}</div>
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1 mt-2">{m.stat}</div>
                  <button onClick={() => setLeadModal(`Book a session with ${m.name}`)} className="mt-3 w-full text-xs py-1.5 rounded-lg btn-primary">Book Session</button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Certified Research Mentors</p>
            <div className="grid md:grid-cols-2 gap-5">
              {CERTIFIED_MENTORS.map((m,i) => (
                <div key={i} className="card p-5 flex gap-4 hover:shadow-md transition">
                  <Avatar src={m.photo} name={m.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-bingo-dark">{m.name}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{m.tag}</span>
                    </div>
                    <div className="text-xs text-primary font-medium mt-0.5">{m.title}</div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{m.intro}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{m.awards}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="card p-5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">Want a personalised mentor match?</p>
              <p className="text-xs text-slate-500 mt-0.5">Take the free AI assessment to get matched to the right mentor for your goals</p>
            </div>
            <Link to="/ai-test" className="btn-primary text-sm px-4 py-2">Take Assessment to Get Matched →</Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: CHECK-IN & POINTS
      ══════════════════════════════════════════ */}
      {tab === 'checkin' && (
        <div className="space-y-8">
          {/* Week strip */}
          <div className="card p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-bingo-dark">📅 This Week's Check-In</h3>
              <div className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">Streak bonus at 7 days: +50 pts!</div>
            </div>
            <div className="flex gap-2 mb-3">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
                <div key={i} className={`flex-1 rounded-lg py-2 flex flex-col items-center text-xs font-medium ${i < 3 ? 'bg-green-500 text-white' : i === 3 ? 'bg-primary text-white ring-2 ring-primary/40' : 'bg-white border border-slate-200 text-slate-400'}`}>
                  <span>{d}</span>
                  {i < 3 && <span className="text-[9px]">✓</span>}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Current streak: <strong className="text-green-700">3 days</strong></span>
              <span>Total points: <strong className="text-primary">380 pts</strong></span>
            </div>
          </div>

          {/* Tasks */}
          <section>
            <h3 className="font-semibold text-bingo-dark mb-3">Today's Check-In Tasks</h3>
            <div className="space-y-3">
              {CHECKIN_TASKS.map(t => (
                <div key={t.id} className={`card p-4 flex items-center gap-4 ${t.exclusive ? 'border-amber-200/60 bg-amber-50/30' : ''}`}>
                  <div className="text-2xl shrink-0">{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-bingo-dark text-sm">{t.title}</span>
                      {t.exclusive && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Scholar Bonus</span>}
                    </div>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                      <span className="text-green-600 font-medium">+{t.pts} pts</span>
                      <span className="text-amber-600 font-medium">+{t.scholarPts} scholar pts</span>
                    </div>
                  </div>
                  <button
                    onClick={() => doCheckin(t.id)}
                    disabled={checkedIn[t.id]}
                    className={`shrink-0 text-xs px-4 py-2 rounded-xl font-medium transition ${checkedIn[t.id] ? 'bg-green-100 text-green-700 cursor-default' : 'btn-primary hover:scale-105'}`}
                  >
                    {checkedIn[t.id] ? '✓ Done!' : 'Check In'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Points earning guide */}
          <section>
            <h3 className="font-semibold text-bingo-dark mb-3">How to Earn More Points</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[['Daily Check-In','+5 pts','','+1 scholar pt'],['Weekly 7-day Streak','','','+50 pts bonus'],['Complete a Lesson','+20 pts','','+3 scholar pts'],['Submit a Project','+100 pts','','+15 scholar pts'],['Mentor Q&A Interaction','+30 pts','','+5 scholar pts'],['Refer a Friend','+200 pts','','+20 scholar pts'],['Community Post Approved','+50 pts','','+8 scholar pts'],['Competition Participation','+150 pts','','+25 scholar pts']].map(([a,,b,c],i) => (
                <div key={i} className="card p-3 flex items-center justify-between">
                  <span className="text-slate-700 text-xs">{a}</span>
                  <div className="flex gap-2 text-xs font-semibold">
                    {a !== 'Weekly 7-day Streak' && <span className="text-green-600">+pts</span>}
                    <span className="text-amber-600">{c}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rewards */}
          <section>
            <h3 className="font-semibold text-bingo-dark mb-3">Redeem Your Points</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CHECKIN_REWARDS.map((r,i) => (
                <div key={i} className={`card p-5 flex flex-col hover:shadow-md transition ${r.scholarOnly ? 'border-amber-200/60 bg-amber-50/20' : ''}`}>
                  <div className="text-2xl mb-2">{r.icon}</div>
                  <div className="font-semibold text-bingo-dark text-sm">{r.title}</div>
                  <div className="text-xs font-bold text-green-600 bg-green-50 rounded-full px-2 py-0.5 inline-block my-1.5 self-start">{r.pts} pts</div>
                  <p className="text-xs text-slate-500 flex-1">{r.desc}</p>
                  {r.scholarOnly && <span className="text-[10px] text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 self-start mt-1">Scholar members only</span>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-slate-400">{r.stock}</span>
                    <button
                      onClick={() => setRedeemed(p => ({...p,[i]:true}))}
                      disabled={redeemed[i]}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${redeemed[i] ? 'bg-green-100 text-green-700 cursor-default' : 'btn-primary'}`}
                    >
                      {redeemed[i] ? '✓ Redeemed' : 'Redeem'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Leaderboard */}
          <section>
            <h3 className="font-semibold text-bingo-dark mb-3">Weekly Check-In Leaders</h3>
            <div className="space-y-2">
              {STAR_STUDENTS.slice(0,5).map((s,i) => (
                <div key={i} className="card p-3 flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-slate-100 text-slate-600':i===2?'bg-orange-100 text-orange-600':'bg-slate-50 text-slate-400'}`}>{i+1}</div>
                  <div className="text-lg">{s.avatar}</div>
                  <div className="flex-1 min-w-0"><div className="font-medium text-sm text-bingo-dark">{s.name}</div><div className="text-xs text-slate-500">{s.grade}</div></div>
                  <div className="text-right"><div className="font-bold text-primary text-sm">{s.pts}</div><div className="text-[10px] text-slate-400">pts</div></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: CERTIFIED COURSES
      ══════════════════════════════════════════ */}
      {tab === 'courses' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">📜 Certified Course Programmes</h2>
            <p className="text-slate-500 text-sm">Authoritative certifications aligned with industry standards and college admissions requirements. Every course links directly to the Scholar points system.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {CERT_COURSES.map((c,i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-bingo-dark">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{c.age}</p>
                  </div>
                  {c.partnerCert && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold shrink-0">Partner Certified</span>}
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">📜 {c.cert}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐ {c.scholarPts}</span>
                </div>
                <div className="flex gap-2">
                  <Link to="/courses" className="btn-primary text-xs px-3 py-1.5">View Course</Link>
                  <button onClick={() => setScholarModal(true)} className="border border-amber-400 text-amber-700 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-50 transition">Apply for Scholar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">Not sure which certification is right for you?</p>
              <p className="text-xs text-slate-500 mt-0.5">Take the free 3-minute AI assessment for an instant recommendation</p>
            </div>
            <Link to="/ai-test" className="btn-primary text-sm px-5 py-2">Free Assessment →</Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: PARTNER INSTITUTIONS
      ══════════════════════════════════════════ */}
      {tab === 'partners' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-bingo-dark mb-1">🏫 Certified Partner Institutions</h2>
            <p className="text-slate-500 text-sm">Our Super Scholar certificates are jointly certified by partner institutions. These organisations provide research facilities, competition resources, and industry credibility for our students.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PARTNERS.map((p,i) => (
              <div key={i} className="card p-4 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-primary/60 group-hover:bg-primary/10 mb-2">{p.name.charAt(0)}</div>
                <div className="font-medium text-bingo-dark text-xs leading-tight mb-1">{p.name}</div>
                <div className="text-[10px] text-slate-500">{p.region}</div>
                <span className="mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{p.type}</span>
              </div>
            ))}
          </div>
          <div className="card p-5 bg-amber-50/40 border-amber-200/60">
            <h3 className="font-semibold text-bingo-dark mb-2">Institutional Partnership</h3>
            <p className="text-sm text-slate-600 mb-3">Partner institutions jointly certify our Scholar certificates, provide research training resources, and sponsor competition opportunities for our students.</p>
            <a href="/#/join" className="btn-primary text-sm px-5 py-2 inline-block">Become a Partner Institution →</a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: Forum (BBS-style)
      ══════════════════════════════════════════ */}
      {tab === 'forum' && <ForumSection />}

      {/* ── Bottom CTA strip ── */}
      <div className="mt-10 card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">Ready to start your AI journey?</p>
          <p className="text-xs text-slate-500 mt-0.5">Join free · take the assessment · get your Scholar path</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/ai-test" className="btn-primary text-sm px-4 py-2">🧠 Free AI Assessment</Link>
          <button onClick={() => setScholarModal(true)} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-amber-600 transition">⭐ Apply for Scholar</button>
          <button onClick={() => setLeadModal('Book a Free Consultation')} className="border border-primary text-primary text-sm px-4 py-2 rounded-xl hover:bg-primary/5 transition">Free Consultation</button>
        </div>
      </div>

    </div>
  )
}
