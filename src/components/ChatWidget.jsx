import { useState, useRef, useEffect } from 'react'

const GREETING = 'Hi! I\'m Bingo AI Assistant. How can I help you today? You can ask about our courses, Science Camp, or admissions.'
const FALLBACK = 'Thanks for your message. For detailed inquiries, please email us or visit our Contact page. Is there anything else I can help with?'

const QUICK_REPLIES = {
  course: 'We offer Basic (K7-K9), Intermediate (K9-K11), and Advanced (K10-K12) courses. Basic is $890, Intermediate $990, Advanced $1290. Visit our AI Courses page for details!',
  camp: 'Our Science Camp program is $1590. It includes AI literacy, data science, and machine learning camps. Check the Science Camp page for more info.',
  price: 'Basic Course $890 · Intermediate $990 · Advanced $1290 · Science Camp $1590. All prices in USD.',
  contact: 'You can reach us through the contact form or email. For course registration, please visit the relevant course page and use the Purchase button.',
}

function getReply(text) {
  const lower = text.toLowerCase()
  if (lower.includes('course') || lower.includes('课')) return QUICK_REPLIES.course
  if (lower.includes('camp') || lower.includes('营')) return QUICK_REPLIES.camp
  if (lower.includes('price') || lower.includes('cost') || lower.includes('多少钱') || lower.includes('fee')) return QUICK_REPLIES.price
  if (lower.includes('contact') || lower.includes('email') || lower.includes('联系')) return QUICK_REPLIES.contact
  return FALLBACK
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: GREETING, id: 0 },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return

    const userMsg = { role: 'user', text, id: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const reply = getReply(text)
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, id: Date.now() + 1 }])
    }, 600)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[480px] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1a7 7 0 01-7 7H9a7 7 0 01-7-7H1a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Bingo AI Assistant</h3>
                <p className="text-xs text-white/80">Online now</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <button
                type="submit"
                className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition"
                aria-label="Send"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
