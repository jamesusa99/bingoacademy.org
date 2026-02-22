import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Product data ───────────────────────────────────────────────────

const COURSES = [
  { id: 'c1', name: 'AI Foundations Bootcamp (Ages 8–12)', type: 'course', cat: 'qizhi', tag: '🔥 Bestseller', price: 299, bPrice: '¥199/seat (bulk)', sold: 3420, rating: 4.9, desc: 'Core AI literacy, visual programming, and introductory projects. Suitable for complete beginners.', badge: '启智阶', aiLab: false },
  { id: 'c2', name: 'Competition Sprint: National AI Challenge', type: 'course', cat: 'competition', tag: '⭐ Top-rated', price: 890, bPrice: '¥690/seat (bulk)', sold: 1240, rating: 4.8, desc: 'Competition-specific prep: project selection, development, defence. 86% pass-through rate.', badge: '竞赛培优', aiLab: true },
  { id: 'c3', name: 'Python + AI Projects (Middle School)', type: 'course', cat: 'jichu', tag: '📈 Popular', price: 680, bPrice: '¥480/seat (bulk)', sold: 2100, rating: 4.7, desc: 'Python basics to machine learning projects. Produces verifiable competition-ready work.', badge: '基础阶', aiLab: false },
  { id: 'c4', name: 'AIGC Creative Design Course', type: 'course', cat: 'aigc', tag: '🆕 New', price: 490, bPrice: '¥360/seat (bulk)', sold: 870, rating: 4.8, desc: 'AI art, prompt engineering, creative concept development. Portfolio-ready in 3 weeks.', badge: 'AIGC', aiLab: false },
  { id: 'c5', name: 'AI Lab Companion Course (Institution)', type: 'course', cat: 'lab', tag: '🏫 B-End', price: null, bPrice: 'Consult for pricing', sold: 340, rating: 4.9, desc: 'Structured curriculum matched to the AI Digital Lab setup. Delivered with lab deployment.', badge: '实验室配套', aiLab: true },
  { id: 'c6', name: 'Parent: Understanding AI Education', type: 'course', cat: 'parent', tag: '💰 ¥9.9', price: 9.9, bPrice: null, sold: 8900, rating: 4.9, desc: 'Best-selling parent guide. 30-minute video course explaining AI education and how to choose the right path.', badge: '家长必读', aiLab: false },
]

const EVENTS_PRODUCTS = [
  { id: 'e1', name: 'National AI Challenge — Full Entry Package', type: 'event', tag: '✦ Whitelist', price: 380, bPrice: 'Group pricing available', desc: 'Registration + materials + mock defence session. Whitelist competition.', deadline: 'Rolling' },
  { id: 'e2', name: 'Competition Bootcamp — 6-Week Sprint', type: 'event', tag: '🏆 Award-focused', price: 890, bPrice: '¥690/student (group)', desc: 'Full competition prep camp. Historically 86% award rate for completing students.', deadline: 'Mar 2026' },
  { id: 'e3', name: 'Bingo Cup AI Design — Entry + Coaching', type: 'event', tag: '🎨 AIGC Track', price: 490, bPrice: 'Group from ¥380', desc: 'Bingo\'s own flagship competition. Entry fee + 4 coaching sessions + judging prep.', deadline: 'Apr 2026' },
  { id: 'e4', name: 'Institution Group Entry Package (10+ students)', type: 'event', tag: '🏫 B-End Exclusive', price: null, bPrice: 'From ¥3,200/group', desc: 'Group entry management + dedicated coach + institution branding support.', deadline: 'Flexible' },
]

const CERT_PRODUCTS = [
  { id: 'cert1', name: 'AI Foundations Certificate (Qizhi)', type: 'cert', tag: '🌱 Entry level', price: 198, bPrice: 'Bulk: ¥149/student', desc: 'Nationally verifiable. Dual-endorsed by institution + issuing centre. Suitable for Grades 3–6.' },
  { id: 'cert2', name: 'AI Application Certificate (Jichu)', type: 'cert', tag: '📘 Intermediate', price: 298, bPrice: 'Bulk: ¥229/student', desc: 'AI project proficiency. Referenced in STEM admissions applications.' },
  { id: 'cert3', name: 'AI Innovation Certificate (Zhichuang)', type: 'cert', tag: '🏆 Top tier', price: 498, bPrice: 'Bulk: ¥380/student', desc: 'Highest tier. Accepted for 综评 and 强基 supplementary evidence.' },
  { id: 'cert4', name: 'Teacher Advanced Certification', type: 'cert', tag: '👩‍🏫 Teacher', price: 680, bPrice: 'Institution package pricing', desc: 'For institutions: certify your teaching staff. Required for Jinyan/Zhichuang tier status.' },
]

const MATERIALS = [
  { id: 'm1', name: 'AI Literacy Textbook Series (Grades 3–9)', type: 'material', tag: '📚 Digital', price: 128, bPrice: 'Bulk: ¥89/set', desc: 'Full 7-volume series. Digital + print options. Updated annually. Aligned to Bingo 9-star curriculum.' },
  { id: 'm2', name: 'AI Hardware Kit — Starter (Ages 8–12)', type: 'material', tag: '🔧 Physical', price: 398, bPrice: 'Bulk: ¥298/kit', desc: 'Components + instructions + companion digital guide. Compatible with Foundations Bootcamp.' },
  { id: 'm3', name: 'Robotics & Sensors Kit (Ages 12+)', type: 'material', tag: '🤖 Advanced', price: 698, bPrice: 'Bulk: ¥520/kit', desc: 'For Competition Sprint or Robotics competition prep. Includes sensor pack + codebase.' },
  { id: 'm4', name: 'AI Course + Starter Kit Bundle', type: 'material', tag: '💰 Bundle deal', price: 599, bPrice: 'Bulk: ¥440/bundle', desc: 'Foundations Bootcamp course + physical starter kit. Save ¥98 vs. buying separately.' },
]

const AI_LAB = [
  { id: 'lab1', name: 'AI Digital Lab — Personal Edition', type: 'lab', tag: '🏠 For families', price: 299, bPrice: null, desc: 'Cloud-based virtual AI lab. Sim experiments, AI guidance, 3-month access. Beginner-friendly.' },
  { id: 'lab2', name: 'AI Digital Lab — Family Starter', type: 'lab', tag: '👨‍👩‍👧 1-year access', price: 899, bPrice: null, desc: 'Full-year access + parent dashboard + 2 online coaching sessions. Best value home plan.' },
  { id: 'lab3', name: 'AI Digital Lab — Institution Standard', type: 'lab', tag: '🏫 B-End', price: null, bPrice: 'From ¥12,800/yr · up to 50 students', desc: 'Institution-grade lab with teacher dashboard, student progress, and branded environment.' },
  { id: 'lab4', name: 'AI Digital Lab — Custom Build', type: 'lab', tag: '✏️ Custom', price: null, bPrice: 'Consult for proposal', desc: 'Fully customised lab environment with your institution\'s branding, curriculum, and integration.' },
]

const AI_TRAINING = [
  { id: 'tr1', name: 'AI Training Room — Standard Package', type: 'training', tag: '🏫 For institutions', price: null, bPrice: 'From ¥68,000', desc: 'Complete hardware + software + curriculum. Fits 20–30 students. On-site installation + teacher training included.' },
  { id: 'tr2', name: 'AI Training Room — Custom Build', type: 'training', tag: '✏️ Enterprise', price: null, bPrice: 'Request proposal', desc: 'Fully configured to your space, student count, and curriculum needs. Full project management.' },
  { id: 'tr3', name: 'AI Competition Training Station (C-end)', type: 'training', tag: '🏆 Personal', price: 2980, bPrice: null, desc: 'Compact personal training station. Ideal for high-school students preparing for AI science competitions.' },
  { id: 'tr4', name: 'Teacher Training Service Bundle', type: 'training', tag: '👩‍🏫 B-End', price: null, bPrice: 'From ¥8,800', desc: 'On-site teacher training for AI training room operation. Covers curriculum delivery + equipment use.' },
]

// ─── Sub-components ────────────────────────────────────────────────

function ProductModal({ item, onClose, onCart, onBuy }) {
  const [qty, setQty] = useState(1)
  const [bookDone, setBookDone] = useState(false)
  if (!item) return null
  const isBOnly = !item.price
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              {item.tag && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium mb-1 inline-block">{item.tag}</span>}
              <h3 className="font-bold text-bingo-dark">{item.name}</h3>
              {item.sold && <p className="text-xs text-slate-400 mt-0.5">{item.sold.toLocaleString()}+ sold · {item.rating && `${item.rating}★ rating`}</p>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-3 shrink-0">×</button>
          </div>

          <p className="text-sm text-slate-600 mb-4">{item.desc}</p>

          <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
            {item.price && <div><span className="text-slate-500">C-end price: </span><span className="font-bold text-primary text-lg">¥{item.price}</span></div>}
            {item.bPrice && <div><span className="text-slate-500">B-end / bulk: </span><span className="font-semibold text-amber-600">{item.bPrice}</span></div>}
            {item.deadline && <div><span className="text-slate-500">Deadline: </span><span className="text-slate-700">{item.deadline}</span></div>}
            {item.badge && <div><span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.badge}</span></div>}
          </div>

          {/* Key selling points */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
            {['✓ Verified quality', '✓ Instant access', '✓ Money-back guarantee'].map((s,i) => (
              <div key={i} className="bg-green-50 text-green-700 rounded-lg p-2">{s}</div>
            ))}
          </div>

          {!isBOnly && item.price && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-500">Qty:</span>
              <button onClick={() => setQty(q => Math.max(1,q-1))} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm">−</button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(q => q+1)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm">+</button>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {item.price && (
              <>
                <button onClick={() => { onBuy(item); onClose() }} className="flex-1 btn-primary text-sm py-2.5">Buy Now — ¥{item.price * qty}</button>
                <button onClick={() => { onCart(item); onClose() }} className="border border-primary text-primary text-sm px-4 py-2.5 rounded-xl hover:bg-primary/5 transition">Add to Cart</button>
              </>
            )}
            {(isBOnly || item.bPrice) && (
              <button onClick={() => setBookDone(true)} className={`${isBOnly ? 'flex-1' : ''} bg-amber-500 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-amber-600 transition`}>
                {bookDone ? '✅ Request sent!' : 'Contact B-end Advisor →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ item, onOpen }) {
  const isBOnly = !item.price
  return (
    <div className="card p-4 flex flex-col hover:shadow-md hover:border-primary/30 transition cursor-pointer" onClick={() => onOpen(item)}>
      <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 h-24 flex items-center justify-center text-3xl mb-3 hover:from-primary/10 hover:to-primary/20 transition">
        {item.type === 'course' ? '🎓' : item.type === 'event' ? '🏆' : item.type === 'cert' ? '📜' : item.type === 'material' ? '📚' : item.type === 'lab' ? '🔬' : '🖥️'}
      </div>
      {item.tag && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium mb-1 self-start">{item.tag}</span>}
      <h3 className="font-semibold text-bingo-dark text-sm mb-0.5 line-clamp-2">{item.name}</h3>
      {item.sold && <p className="text-[10px] text-slate-400 mb-1">{item.sold.toLocaleString()}+ sold{item.rating ? ` · ${item.rating}★` : ''}</p>}
      <p className="text-xs text-slate-500 line-clamp-2 flex-1 mb-2">{item.desc}</p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
        <div>
          {item.price && <span className="font-bold text-primary">¥{item.price}</span>}
          {isBOnly && <span className="text-xs text-amber-600 font-medium">Consult pricing</span>}
        </div>
        <button className="text-xs btn-primary px-3 py-1.5">Details →</button>
      </div>
    </div>
  )
}

function BookingModal({ title, onClose }) {
  const [done, setDone] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-bingo-dark mb-1">Booking Confirmed!</p>
            <p className="text-sm text-slate-600 mb-3">Our team will contact you within 2 hours to confirm your appointment.</p>
            <button onClick={onClose} className="btn-primary px-5 py-2 text-sm">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-bingo-dark text-sm">{title}</h3>
              <button onClick={onClose} className="text-slate-400 text-xl leading-none">×</button>
            </div>
            <div className="space-y-2.5 mb-4">
              {['Your name *', 'Phone *', 'Organisation (if applicable)', 'Preferred date / time'].map((f,i) => (
                <input key={i} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
              ))}
              <textarea placeholder="Notes or specific requirements" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
            </div>
            <button onClick={() => setDone(true)} className="w-full btn-primary py-2.5">Submit Booking</button>
          </>
        )}
      </div>
    </div>
  )
}

function CheckoutModal({ items, onClose }) {
  const [step, setStep] = useState(1)
  const total = items.reduce((s,i) => s + (i.price || 0), 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={step < 3 ? onClose : undefined}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-bingo-dark">Checkout</h3>
            {step < 3 && <button onClick={onClose} className="text-slate-400 text-xl leading-none">×</button>}
          </div>

          {/* Step indicators */}
          <div className="flex gap-1 items-center mb-5 text-xs">
            {[['1','Order'],['2','Details'],['3','Done']].map(([n,l],i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{n}</div>
                <span className={step > i ? 'text-primary font-medium' : 'text-slate-400'}>{l}</span>
                {i < 2 && <span className="text-slate-300 mx-0.5">→</span>}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="space-y-2 mb-4">
                {items.map((item,i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl p-3">
                    <span className="text-slate-700 flex-1 mr-2">{item.name}</span>
                    <span className="font-medium text-primary shrink-0">{item.price ? `¥${item.price}` : 'Quote'}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="text-slate-500">Subtotal</span><span className="font-bold text-bingo-dark">¥{total}</span>
              </div>
              <div className="flex items-center justify-between mb-4 text-xs text-green-600">
                <span>Points discount (if any)</span><span>−¥0</span>
              </div>
              <button onClick={() => setStep(2)} className="w-full btn-primary py-2.5">Continue to Details</button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="space-y-2.5 mb-4">
                {['Full name *', 'Phone *', 'Email (for digital products)', 'Delivery address (physical items only)'].map((f,i) => (
                  <input key={i} placeholder={f} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['WeChat Pay', 'Alipay'].map((p,i) => (
                  <button key={i} className={`rounded-xl border-2 px-3 py-2 text-sm font-medium transition ${i===0 ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{p}</button>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm font-bold mb-4">
                <span>Total</span><span className="text-primary text-lg">¥{total}</span>
              </div>
              <button onClick={() => setStep(3)} className="w-full btn-primary py-2.5">Pay ¥{total}</button>
            </>
          )}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-bingo-dark text-lg mb-2">Order Placed!</p>
              <p className="text-sm text-slate-600 mb-1">Your order has been confirmed. Digital products are now accessible in your account.</p>
              <p className="text-xs text-slate-400 mb-4">Order no: BINGO-{Date.now().toString().slice(-8)}</p>
              <p className="text-xs text-green-600 mb-4">+{Math.floor(total)} points earned from this purchase</p>
              <button onClick={onClose} className="btn-primary px-6 py-2">Back to Mall</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export default function Mall() {
  const [audience, setAudience] = useState('both')
  const [tab, setTab] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [bookingModal, setBookingModal] = useState(null)
  const [points] = useState(1280)
  const [bannerIdx, setBannerIdx] = useState(0)

  const addToCart = (item) => setCart(c => [...c, item])
  const buyNow = (item) => { setCart([item]); setCheckoutOpen(true) }
  const cartCount = cart.length

  const TABS = [
    { id: 'home', icon: '🏠', label: 'Mall Home' },
    { id: 'courses', icon: '🎓', label: 'AI Courses' },
    { id: 'events', icon: '🏆', label: 'Competition Services' },
    { id: 'cert', icon: '📜', label: 'Certification' },
    { id: 'materials', icon: '📚', label: 'Books & Kits' },
    { id: 'lab', icon: '🔬', label: 'AI Digital Lab' },
    { id: 'training', icon: '🖥️', label: 'AI Training Room' },
    { id: 'c-zone', icon: '👨‍👩‍👧', label: 'Family Zone' },
    { id: 'b-zone', icon: '🏫', label: 'Institution Zone' },
  ]

  const BANNERS = [
    { bg: 'from-primary/20 to-cyan-100', icon: '🎓', headline: 'Spring Sale — AI Courses from ¥9.9', sub: 'Limited time. Parent guide + all starter courses on offer.', cta: 'Shop Courses', target: 'courses' },
    { bg: 'from-amber-100 to-orange-50', icon: '🔬', headline: 'AI Digital Lab — Personal Edition Launch', sub: '3 months cloud access. Start experimenting today.', cta: 'View Lab Plans', target: 'lab' },
    { bg: 'from-violet-100 to-purple-50', icon: '🏆', headline: 'Competition Season — Entry + Bootcamp Bundles', sub: 'March registration open. Whitelist competitions available.', cta: 'Browse Events', target: 'events' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {selectedProduct && <ProductModal item={selectedProduct} onClose={() => setSelectedProduct(null)} onCart={addToCart} onBuy={buyNow} />}
      {bookingModal && <BookingModal title={bookingModal} onClose={() => setBookingModal(null)} />}
      {checkoutOpen && <CheckoutModal items={cart} onClose={() => { setCheckoutOpen(false); setCart([]) }} />}

      {/* Cart sidebar trigger */}
      {cartCount > 0 && !checkoutOpen && (
        <button onClick={() => setCheckoutOpen(true)}
          className="fixed bottom-24 right-5 z-40 bg-primary text-white rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm font-semibold hover:bg-primary/90 transition">
          🛒 Cart ({cartCount})
        </button>
      )}

      {/* ── Hero ── */}
      <section className="mb-8">
        {/* Banner */}
        <div className={`rounded-2xl bg-gradient-to-r ${BANNERS[bannerIdx].bg} p-8 flex flex-wrap items-center justify-between gap-4 mb-5`}>
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Bingo AI Smart Mall</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-1">{BANNERS[bannerIdx].headline}</h1>
            <p className="text-slate-600 text-sm mb-4">{BANNERS[bannerIdx].sub}</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setTab(BANNERS[bannerIdx].target)} className="btn-primary px-5 py-2">{BANNERS[bannerIdx].cta} →</button>
              <div className="flex gap-1 items-center">
                {BANNERS.map((_,i) => <button key={i} onClick={() => setBannerIdx(i)} className={`w-2 h-2 rounded-full transition ${i===bannerIdx?'bg-primary':'bg-slate-300'}`} />)}
              </div>
            </div>
          </div>
          <div className="text-6xl hidden sm:block">{BANNERS[bannerIdx].icon}</div>
        </div>

        {/* Audience toggle + stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            {[['both','All Products'],['c','Family / Personal'],['b','Institutions & Schools']].map(([k,l]) => (
              <button key={k} onClick={() => setAudience(k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${audience===k?'bg-bingo-dark text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-3 text-xs text-slate-500">
            <span>🪙 <strong className="text-primary">{points.toLocaleString()}</strong> points</span>
            <button onClick={() => setBookingModal('Request a Purchase Advisor')} className="text-primary hover:underline">Get advisor →</button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['10,000+','Products Sold'],['3,500+','Satisfied Families'],['200+','Partner Institutions'],['50+','Whitelist Events']].map(([v,l],i) => (
            <div key={i} className="card p-3 text-center"><div className="font-bold text-primary">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
          ))}
        </div>
      </section>

      {/* Tab nav */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${tab===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ MALL HOME ══════════════════ */}
      {tab === 'home' && (
        <div className="space-y-8">
          {/* 6 category grid */}
          <section>
            <h2 className="section-title mb-5">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { icon: '🎓', name: 'AI Courses', sub: 'From ¥9.9', tab: 'courses', hot: true },
                { icon: '🏆', name: 'Competition', sub: 'Whitelist entry', tab: 'events' },
                { icon: '📜', name: 'Certification', sub: 'Nationally valid', tab: 'cert' },
                { icon: '📚', name: 'Books & Kits', sub: 'Digital + Physical', tab: 'materials' },
                { icon: '🔬', name: 'AI Lab', sub: 'Cloud virtual lab', tab: 'lab', hot: true },
                { icon: '🖥️', name: 'Training Room', sub: 'Institution setup', tab: 'training' },
              ].map((c,i) => (
                <button key={i} onClick={() => setTab(c.tab)}
                  className="card p-4 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition relative">
                  {c.hot && <span className="absolute top-2 right-2 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">HOT</span>}
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-semibold text-bingo-dark text-xs">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.sub}</div>
                </button>
              ))}
            </div>
          </section>

          {/* B/C split */}
          <section>
            <h2 className="section-title mb-4">Choose Your Path</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="card p-6 border-2 border-primary/20 bg-primary/5">
                <div className="text-3xl mb-2">👨‍👩‍👧</div>
                <h3 className="font-bold text-bingo-dark mb-1">Family & Personal Zone</h3>
                <p className="text-sm text-slate-600 mb-4">Curated AI learning products for children and families. Personalised recommendations based on age and AI assessment results.</p>
                <ul className="space-y-1 text-xs text-slate-600 mb-4">
                  {['Personalised age-based recommendations','Points & rewards on every purchase','Share to earn — referral commissions','AI lab personal home access'].map((b,i) => <li key={i} className="flex gap-1.5"><span className="text-primary">✓</span>{b}</li>)}
                </ul>
                <button onClick={() => setTab('c-zone')} className="btn-primary w-full py-2.5">Enter Family Zone →</button>
              </div>
              <div className="card p-6 border-2 border-amber-200/60 bg-amber-50/20">
                <div className="text-3xl mb-2">🏫</div>
                <h3 className="font-bold text-bingo-dark mb-1">Institution & School Zone</h3>
                <p className="text-sm text-slate-600 mb-4">Bulk purchasing, curriculum licensing, AI training room setup, and full institutional empowerment services.</p>
                <ul className="space-y-1 text-xs text-slate-600 mb-4">
                  {['Volume discounts on all products','OEM curriculum + branding rights','AI training room full installation support','Dedicated 1-on-1 purchasing advisor'].map((b,i) => <li key={i} className="flex gap-1.5"><span className="text-amber-600">✓</span>{b}</li>)}
                </ul>
                <button onClick={() => setTab('b-zone')} className="bg-amber-500 text-white w-full py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition">Enter Institution Zone →</button>
              </div>
            </div>
          </section>

          {/* Flash deals */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">🔥 Flash Deals</h2>
              <span className="text-xs text-slate-400">Updated daily</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...COURSES.slice(0,2), ...MATERIALS.slice(3,4), ...AI_LAB.slice(0,1), ...CERT_PRODUCTS.slice(2,3), ...EVENTS_PRODUCTS.slice(1,2)].map((item,i) => (
                <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
              ))}
            </div>
          </section>

          {/* Brand trust */}
          <section className="card p-5 bg-slate-50 border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 text-center">Why Buy from Bingo Mall</p>
            <div className="grid sm:grid-cols-4 gap-3 text-center text-xs">
              {[['🔒','Verified Quality','All courses and products reviewed by our curriculum team'],['🏅','Authoritative Certs','Issuing-centre endorsed, nationally verifiable'],['📦','Fast Delivery','Digital instant access · Physical 3–5 days'],['💬','After-sales Support','7×12h C-end · Dedicated advisor B-end']].map(([icon,t,d],i) => (
                <div key={i}><div className="text-2xl mb-1">{icon}</div><p className="font-semibold text-bingo-dark mb-0.5">{t}</p><p className="text-slate-500">{d}</p></div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════ COURSES ══════════════════ */}
      {tab === 'courses' && (
        <div className="space-y-5">
          <div className="card p-4 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">🎓 AI Courses</h2>
            <p className="text-slate-500 text-sm">Curriculum matched to the Bingo 9-star framework. Competition prep, foundations, AIGC, and parent series. C-end and B-end pricing shown.</p>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            {['All','Competition Prep','Foundations','AIGC','AI Lab Companion','Parent Series'].map((f,i) => (
              <button key={i} className={`px-3 py-1.5 rounded-xl font-medium transition ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(audience === 'b' ? COURSES.filter(c => c.badge === '实验室配套' || !c.price || c.bPrice) : audience === 'c' ? COURSES.filter(c => c.price) : COURSES).map((item,i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          <div className="card p-4 bg-amber-50/20 border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-medium text-bingo-dark text-sm">Need a bulk curriculum package for your institution?</p><p className="text-xs text-slate-500">OEM licensing, branded materials, and teacher training included</p></div>
            <button onClick={() => setBookingModal('Bulk Course Package — Institution Enquiry')} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition">Request B-end Package</button>
          </div>
        </div>
      )}

      {/* ══════════════════ EVENTS ══════════════════ */}
      {tab === 'events' && (
        <div className="space-y-5">
          <div className="card p-4 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">🏆 Competition Services</h2>
            <p className="text-slate-500 text-sm">Entry packages, bootcamp training, and full coaching programmes. Whitelist and Bingo-own competitions.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {EVENTS_PRODUCTS.map((item,i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Not sure which competition to enter?</p>
            <div className="flex gap-2">
              <Link to="/ai-test" className="btn-primary text-xs px-4 py-2">Free AI Assessment →</Link>
              <Link to="/events" className="border border-primary text-primary text-xs px-4 py-2 rounded-xl hover:bg-primary/5 transition">Competition Hub →</Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CERTIFICATION ══════════════════ */}
      {tab === 'cert' && (
        <div className="space-y-5">
          <div className="card p-4 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">📜 Certification Products</h2>
            <p className="text-slate-500 text-sm">Learner, teacher, and institution certifications. Dual-endorsed, nationally verifiable. Admissions-referenced at Zhichuang tier.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {CERT_PRODUCTS.map((item,i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">View full certification system and requirements</p>
            <Link to="/cert" className="btn-primary text-xs px-4 py-2">Certification Centre →</Link>
          </div>
        </div>
      )}

      {/* ══════════════════ MATERIALS ══════════════════ */}
      {tab === 'materials' && (
        <div className="space-y-5">
          <div className="card p-4 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">📚 Books, Kits & Teaching Materials</h2>
            <p className="text-slate-500 text-sm">Digital textbooks, physical hardware kits, and teaching bundles. Matched to Bingo curriculum stages.</p>
          </div>
          <div className="flex gap-2 text-xs flex-wrap">
            {['All','Digital Textbooks','Hardware Kits','Lab Equipment','Course Bundles'].map((f,i) => (
              <button key={i} className={`px-3 py-1.5 rounded-xl font-medium transition ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {MATERIALS.map((item,i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          <div className="card p-4 bg-amber-50/20 border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">Bulk order 20+ kits? Contact us for custom printing and institution pricing.</p>
            <button onClick={() => setBookingModal('Bulk Materials Order Enquiry')} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition">Bulk Order Enquiry</button>
          </div>
        </div>
      )}

      {/* ══════════════════ AI LAB ══════════════════ */}
      {tab === 'lab' && (
        <div className="space-y-5">
          <div className="card p-4 bg-violet-50/30 border-violet-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">🔬 AI Digital Laboratory</h2>
            <p className="text-slate-600 text-sm">Cloud-based virtual AI lab with guided experiments, AI coaching, and progress tracking. Personal and institutional editions available.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">C-end: Personal & Family</p>
              {AI_LAB.filter(l => l.price).map((item,i) => (
                <div key={i} className="mb-3"><ProductCard item={item} onOpen={setSelectedProduct} /></div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">B-end: Institution & School</p>
              {AI_LAB.filter(l => !l.price).map((item,i) => (
                <div key={i} className="mb-3"><ProductCard item={item} onOpen={setSelectedProduct} /></div>
              ))}
            </div>
          </div>
          <div className="card p-5 grid sm:grid-cols-3 gap-3 text-xs">
            {[['🧪','Guided Experiments','50+ curated AI experiments with step-by-step guidance'],['🤖','AI Coach','In-lab AI tutor answers questions and adapts to student level'],['📊','Progress Dashboard','Parents and teachers see real-time learning progress and milestones']].map(([icon,t,d],i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3"><div className="text-xl mb-1">{icon}</div><p className="font-semibold text-bingo-dark mb-0.5">{t}</p><p className="text-slate-500">{d}</p></div>
            ))}
          </div>
          <button onClick={() => setBookingModal('AI Digital Lab — Free Demo Booking')} className="w-full border border-primary text-primary py-2.5 rounded-xl font-medium text-sm hover:bg-primary/5 transition">Book a Free Lab Demo Session →</button>
        </div>
      )}

      {/* ══════════════════ AI TRAINING ROOM ══════════════════ */}
      {tab === 'training' && (
        <div className="space-y-5">
          <div className="card p-4 bg-amber-50/30 border-amber-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">🖥️ AI Training Room</h2>
            <p className="text-slate-600 text-sm">Full hardware + software + curriculum solutions for institutions and schools. Zero-to-operational setup with on-site installation and teacher training. Personal competition station also available.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {AI_TRAINING.map((item,i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>

          {/* What's included */}
          <div className="card p-5 border-amber-200/60 bg-amber-50/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Standard Package Includes</p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {['Hardware: workstations, display systems, and AI sensor kits','Software: full AI lab management system + student dashboards','Curriculum: aligned to Bingo 9-star framework, updated annually','Installation: on-site delivery, assembly, and commissioning','Teacher training: 2-day in-person training + online follow-up','After-sales: 12-month warranty + quarterly check-ins'].map((s,i) => (
                <div key={i} className="flex gap-1.5"><span className="text-amber-600 shrink-0">✓</span>{s}</div>
              ))}
            </div>
          </div>

          {/* Success cases */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Successful Installations</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[['Future AI Academy, Chengdu','Standard package (25 stations)','90% student satisfaction · 3 national competition entries in year 1'],['Shenyang STEM Centre','Custom build (40 stations)','Flagship status within 6 months · featured in regional education press'],['Beijing Robotics Club','Competition station bundle','8 students advanced to provincial finals']].map(([org,pkg,result],i) => (
                <div key={i} className="card p-4 text-xs">
                  <p className="font-semibold text-bingo-dark">{org}</p>
                  <p className="text-primary mb-1">{pkg}</p>
                  <p className="text-slate-500">{result}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setBookingModal('AI Training Room — Free Site Assessment Booking')} className="w-full bg-amber-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-600 transition">Request Free Site Assessment & Proposal →</button>
        </div>
      )}

      {/* ══════════════════ C-ZONE (FAMILY) ══════════════════ */}
      {tab === 'c-zone' && (
        <div className="space-y-6">
          <div className="card p-5 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">👨‍👩‍👧 Family & Personal Zone</h2>
            <p className="text-slate-600 text-sm">Everything a family needs for a child's AI learning journey — from the first introduction to competition-level preparation.</p>
          </div>

          {/* Age-based selector */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Shop by Age Group</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[['🌱','Ages 3–6','Starter & Intro'],['📚','Ages 7–9','Foundations'],['🔧','Ages 10–12','Applied'],['⚙️','Ages 13–15','Projects'],['🚀','Ages 16+','Competition']].map(([icon,age,label],i) => (
                <button key={i} className="card p-3 text-center hover:shadow-md hover:border-primary/30 transition">
                  <div className="text-xl mb-0.5">{icon}</div>
                  <div className="font-semibold text-bingo-dark text-xs">{age}</div>
                  <div className="text-[10px] text-slate-400">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Top picks for families */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Parent Top Picks</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[COURSES[5], COURSES[0], MATERIALS[0], MATERIALS[1], AI_LAB[0], CERT_PRODUCTS[0]].map((item,i) => (
                <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
              ))}
            </div>
          </div>

          {/* Points & benefits */}
          <div className="card p-5 border-primary/20 bg-primary/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Your Family Benefits</p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {[
                { icon: '🪙', title: 'Points System', desc: `You have ${points.toLocaleString()} points. Every ¥1 spent = 1 point. 100 pts = ¥1 off.` },
                { icon: '💌', title: 'Referral Rewards', desc: 'Share any product and earn commission on every purchase made through your link.' },
                { icon: '🎁', title: 'Family Coupons', desc: 'New-user ¥20 coupon. Monthly activity rewards. AI lab trial credits.' },
              ].map((b,i) => (
                <div key={i} className="bg-white rounded-xl p-3">
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="font-semibold text-bingo-dark mb-0.5">{b.title}</p>
                  <p className="text-slate-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI test link */}
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-bingo-dark text-sm">Not sure where to start?</p>
              <p className="text-xs text-slate-500">Take the free AI assessment to get personalised product recommendations</p>
            </div>
            <Link to="/ai-test" className="btn-primary text-sm px-4 py-2">Free AI Assessment →</Link>
          </div>
        </div>
      )}

      {/* ══════════════════ B-ZONE (INSTITUTION) ══════════════════ */}
      {tab === 'b-zone' && (
        <div className="space-y-6">
          <div className="card p-5 bg-amber-50/30 border-amber-200/60">
            <h2 className="font-bold text-bingo-dark mb-1">🏫 Institution & School Zone</h2>
            <p className="text-slate-600 text-sm">One-stop sourcing for teaching centres and schools. Curriculum + kits + lab + training room + teacher training + certifications. Volume pricing and dedicated advisor included.</p>
          </div>

          {/* Institution benefits */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: '📦', title: 'Volume Pricing', desc: 'Bulk discounts from 10 units. Custom quotes for orders of 50+.' },
              { icon: '🎨', title: 'OEM & Branding', desc: 'Curriculum licensed under your school name. Kits printed with your logo.' },
              { icon: '👩‍🏫', title: 'Teacher Training', desc: 'Online and on-site teacher development. Required for Jinyan/Zhichuang certification.' },
              { icon: '🏆', title: 'Competition Support', desc: 'Group entry management. Dedicated competition coach for institutional entrants.' },
              { icon: '🔬', title: 'Lab & Room Setup', desc: 'AI Digital Lab or full Training Room. We manage the entire deployment.' },
              { icon: '📋', title: 'Dedicated Advisor', desc: '1-on-1 purchasing advisor. Purchase contracts, invoice support, and delivery tracking.' },
            ].map((b,i) => (
              <div key={i} className="card p-4">
                <div className="text-xl mb-1">{b.icon}</div>
                <p className="font-semibold text-bingo-dark text-sm mb-0.5">{b.title}</p>
                <p className="text-xs text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Institution top products */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Top Institution Products</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[COURSES[1], COURSES[4], EVENTS_PRODUCTS[3], AI_LAB[2], AI_TRAINING[0], CERT_PRODUCTS[3]].map((item,i) => (
                <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
              ))}
            </div>
          </div>

          {/* Custom services */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Custom Services</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['📝 Curriculum Design', 'Custom AI curriculum development using your school\'s context and requirements'],
                ['🏷️ Brand Licensing', 'White-label Bingo curriculum and materials under your school brand'],
                ['🖥️ Training Room Build', 'End-to-end AI training room project management from spec to operational'],
                ['🎓 Teacher Certification Drive', 'Whole-school teacher certification coordinated and managed by Bingo'],
              ].map(([t,d],i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 text-xs">
                  <p className="font-semibold text-bingo-dark mb-0.5">{t}</p>
                  <p className="text-slate-500">{d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setBookingModal('Institution Purchasing Advisor — Request a Call')} className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-600 transition">Contact Purchasing Advisor →</button>
            <button onClick={() => setBookingModal('Institution — Bulk Quote Request')} className="flex-1 border border-amber-400 text-amber-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-50 transition">Request Bulk Quote</button>
          </div>
        </div>
      )}

      {/* ── Bottom CTA ── */}
      <div className="mt-10 card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">Earn while you learn</p>
          <p className="text-xs text-slate-500 mt-0.5">Every purchase earns points · Share products to earn commission · Redeem for courses and lab access</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTab('c-zone')} className="btn-primary text-sm px-4 py-2">Family Zone</button>
          <button onClick={() => setTab('b-zone')} className="bg-amber-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-600 transition">Institution Zone</button>
          <button onClick={() => setBookingModal('Mall Purchase Advisor Request')} className="border border-slate-300 text-slate-600 text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition">Get Advisor →</button>
        </div>
      </div>
    </div>
  )
}
