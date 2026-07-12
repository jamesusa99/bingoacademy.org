import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { fetchPaymentsConfig, startMallCheckout, confirmCheckoutSession } from '../lib/checkout'
import { authLink } from '../lib/authRedirect'
import PageContent from '../components/PageContent'
import { MALL_STOREFRONT_TABS } from '../config/mallTabs'
import { getMallTabContent } from '../config/mallContent'
import { useMallContent } from '../hooks/useMallContent'
import { useProductLineVisibility } from '../contexts/ProductLineVisibilityContext'
import {
  filterMallCoursesForTab,
  filterMallProductsForTab,
  filterMallFlashDealItems,
  isMallRetailItem,
} from '../lib/mallTabFilters'
import IoaiMallPackageGrid from '../components/mall/IoaiMallPackageGrid'
import CheckoutTrustMicrocopy from '../components/checkout/CheckoutTrustMicrocopy'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isDbMallItem(item) {
  return UUID_RE.test(item?.id) && (item?.source === 'courses' || item?.source === 'mall_products')
}

// ─── Product data (fallback when Supabase empty) ─────────────────────

const isRetail = isMallRetailItem

const COURSES_FALLBACK = [
  { id: 'c1', name: 'AI Foundations Bootcamp (Ages 8–12)', type: 'course', cat: 'qizhi', tag: '🔥 Bestseller', price: 299, bPrice: '$199/seat (bulk)', sold: 3420, rating: 4.9, desc: 'Core AI literacy, visual programming, and introductory projects. Suitable for complete beginners.', badge: 'Enlightenment', aiLab: false },
  { id: 'c2', name: 'Competition Sprint: National AI Challenge', type: 'course', cat: 'competition', tag: '⭐ Top-rated', price: 890, bPrice: '$690/seat (bulk)', sold: 1240, rating: 4.8, desc: 'Competition-specific prep: project selection, development, defence. 86% pass-through rate.', badge: 'Competition', aiLab: true },
  { id: 'c3', name: 'Python + AI Projects (Middle School)', type: 'course', cat: 'jichu', tag: '📈 Popular', price: 680, bPrice: '$480/seat (bulk)', sold: 2100, rating: 4.7, desc: 'Python basics to machine learning projects. Produces verifiable competition-ready work.', badge: 'Foundations', aiLab: false },
  { id: 'c4', name: 'AIGC Creative Design Course', type: 'course', cat: 'aigc', tag: '🆕 New', price: 490, bPrice: '$360/seat (bulk)', sold: 870, rating: 4.8, desc: 'AI art, prompt engineering, creative concept development. Portfolio-ready in 3 weeks.', badge: 'AIGC', aiLab: false },
  { id: 'c6', name: 'Parent: Understanding AI Education', type: 'course', cat: 'parent', tag: '💰 $9.9', price: 9.9, bPrice: null, sold: 8900, rating: 4.9, desc: 'Best-selling parent guide. 30-minute video course explaining AI education and how to choose the right path.', badge: 'Parent Essentials', aiLab: false },
]

function courseFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type || 'course',
    cat: row.cat,
    tag: row.tag,
    price: row.price != null ? Number(row.price) : null,
    bPrice: row.b_price,
    sold: row.sold ?? 0,
    rating: row.rating,
    desc: row.desc,
    badge: row.badge,
    aiLab: !!row.ai_lab,
    mall_tab: row.mall_tab || null,
    featured_home: !!row.featured_home,
    source: 'courses',
  }
}

const EVENTS_PRODUCTS = [
  { id: 'e1', name: 'National AI Challenge — Full Entry Package', type: 'event', tag: '✦ Prestigious', price: 380, bPrice: 'Group pricing available', desc: 'Registration + materials + mock defence session. Prestigious competition.', deadline: 'Rolling' },
  { id: 'e2', name: 'Competition Bootcamp — 6-Week Sprint', type: 'event', tag: '🏆 Award-focused', price: 890, bPrice: '$690/student (group)', desc: 'Full competition prep camp. Historically 86% award rate for completing students.', deadline: 'Mar 2026' },
  { id: 'e3', name: 'Bingo Cup AI Design — Entry + Coaching', type: 'event', tag: '🎨 AIGC Track', price: 490, bPrice: 'Group from $380', desc: 'Bingo\'s own flagship competition. Entry fee + 4 coaching sessions + judging prep.', deadline: 'Apr 2026' },
]

const CERT_PRODUCTS = [
  { id: 'cert1', name: 'AI Foundations Certificate (Qizhi)', type: 'cert', tag: '🌱 Entry level', price: 198, bPrice: 'Bulk: $149/student', desc: 'Nationally verifiable. Dual-endorsed by institution + issuing centre. Suitable for Grades 3–6.' },
  { id: 'cert2', name: 'AI Application Certificate (Jichu)', type: 'cert', tag: '📘 Intermediate', price: 298, bPrice: 'Bulk: $229/student', desc: 'AI project proficiency. Referenced in STEM admissions applications.' },
  { id: 'cert3', name: 'AI Innovation Certificate (Zhichuang)', type: 'cert', tag: '🏆 Top tier', price: 498, bPrice: 'Bulk: $380/student', desc: 'Highest tier. Accepted for comprehensive evaluation and strong-foundation programme supplementary evidence.' },
  { id: 'cert4', name: 'Teacher Advanced Certification', type: 'cert', tag: '👩‍🏫 Teacher', price: 680, bPrice: 'Institution package pricing', desc: 'For institutions: certify your teaching staff. Required for Jinyan/Zhichuang tier status.' },
]

const MATERIALS = [
  { id: 'm1', name: 'AI Literacy Textbook Series (Grades 3–9)', type: 'material', tag: '📚 Digital', price: 128, bPrice: 'Bulk: $89/set', desc: 'Full 7-volume series. Digital + print options. Updated annually. Aligned to Bingo 9-star curriculum.' },
  { id: 'm2', name: 'AI Hardware Kit — Starter (Ages 8–12)', type: 'material', tag: '🔧 Physical', price: 398, bPrice: 'Bulk: $298/kit', desc: 'Components + instructions + companion digital guide. Compatible with Foundations Bootcamp.' },
  { id: 'm3', name: 'Robotics & Sensors Kit (Ages 12+)', type: 'material', tag: '🤖 Advanced', price: 698, bPrice: 'Bulk: $520/kit', desc: 'For Competition Sprint or Robotics competition prep. Includes sensor pack + codebase.' },
  { id: 'm4', name: 'AI Course + Starter Kit Bundle', type: 'material', tag: '💰 Bundle deal', price: 599, bPrice: 'Bulk: $440/bundle', desc: 'Foundations Bootcamp course + physical starter kit. Save $98 vs. buying separately.' },
]

const AI_LAB = [
  { id: 'lab1', name: 'AI Digital Lab — Personal Edition', type: 'lab', tag: '🏠 For families', price: 299, bPrice: null, desc: 'Cloud-based virtual AI lab. Sim experiments, AI guidance, 3-month access. Beginner-friendly.' },
  { id: 'lab2', name: 'AI Digital Lab — Family Starter', type: 'lab', tag: '👨‍👩‍👧 1-year access', price: 899, bPrice: null, desc: 'Full-year access + parent dashboard + 2 online coaching sessions. Best value home plan.' },
]

const AI_TRAINING = [
  { id: 'tr3', name: 'AI Competition Training Station', type: 'training', tag: '🏆 Personal', price: 2980, bPrice: null, desc: 'Compact personal training station. Ideal for high-school students preparing for AI science competitions.' },
]

// ─── Sub-components ────────────────────────────────────────────────

function ProductModal({ item, onClose, onCart, onBuy, sellingPoints = [] }) {
  const [qty, setQty] = useState(1)
  if (!item) return null
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
            {item.price && <div><span className="text-slate-500">Price: </span><span className="font-bold text-primary text-lg">${item.price}</span></div>}
            {item.deadline && <div><span className="text-slate-500">Deadline: </span><span className="text-slate-700">{item.deadline}</span></div>}
            {item.badge && <div><span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.badge}</span></div>}
          </div>

          {/* Key selling points */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
            {(sellingPoints.length ? sellingPoints : ['✓ Verified quality', '✓ Instant access', '✓ Money-back guarantee']).map((s, i) => (
              <div key={i} className="bg-green-50 text-green-700 rounded-lg p-2">{s}</div>
            ))}
          </div>

          {item.price && (
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
                <button onClick={() => { onBuy(item); onClose() }} className="flex-1 btn-primary text-sm py-2.5">Buy Now — ${item.price * qty}</button>
                <button onClick={() => { onCart(item); onClose() }} className="border border-primary text-primary text-sm px-4 py-2.5 rounded-xl hover:bg-primary/5 transition">Add to Cart</button>
              </>
            )}
          </div>
          {item.price ? <CheckoutTrustMicrocopy variant="light" className="mt-3 w-full" /> : null}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ item, onOpen }) {
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
          {item.price && <span className="font-bold text-primary">${item.price}</span>}
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

function CheckoutModal({
  items,
  onClose,
  stripeCheckout,
  isAuthenticated,
  onStripePay,
  checkoutLoading,
}) {
  const [step, setStep] = useState(1)
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)
  const allStripeReady = items.length > 0 && items.every(isDbMallItem)
  const canStripe = stripeCheckout && allStripeReady && isAuthenticated

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={step < 3 ? onClose : undefined}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-bingo-dark">Checkout</h3>
            {step < 3 && <button type="button" onClick={onClose} className="text-slate-400 text-xl leading-none">×</button>}
          </div>

          <div className="flex gap-1 items-center mb-5 text-xs">
            {[['1', 'Order'], ['2', 'Payment'], ['3', 'Done']].map(([n, l], i) => (
              <div key={l} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{n}</div>
                <span className={step > i ? 'text-primary font-medium' : 'text-slate-400'}>{l}</span>
                {i < 2 ? <span className="text-slate-300 mx-0.5">→</span> : null}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl p-3">
                    <span className="text-slate-700 flex-1 mr-2">{item.name}</span>
                    <span className="font-medium text-primary shrink-0">{item.price ? `$${item.price * (item.quantity || 1)}` : 'Quote'}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-bingo-dark">${total.toFixed(2)}</span>
              </div>
              {!allStripeReady && stripeCheckout ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  Some items are demo listings only. Import mall data via Admin or run <code className="text-[10px]">npm run seed</code> for live Stripe checkout.
                </p>
              ) : null}
              <button type="button" onClick={() => setStep(2)} className="w-full btn-primary py-2.5">Continue to Payment</button>
            </>
          )}

          {step === 2 && (
            <>
              {!isAuthenticated ? (
                <p className="text-sm text-slate-600 mb-4">
                  <Link to={authLink('/login', '/mall')} className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>{' '}
                  to complete your purchase.
                </p>
              ) : null}

              {canStripe ? (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4">
                  <p className="text-sm font-semibold text-bingo-dark mb-1">Secure payment via Stripe</p>
                  <p className="text-xs text-slate-600 mb-3">You will be redirected to Stripe Checkout to pay ${total.toFixed(2)}.</p>
                  <button
                    type="button"
                    disabled={checkoutLoading}
                    onClick={() => onStripePay(items)}
                    className="w-full btn-primary py-2.5 disabled:opacity-60"
                  >
                    {checkoutLoading ? 'Redirecting…' : `Pay $${total.toFixed(2)} with Stripe`}
                  </button>
                  <CheckoutTrustMicrocopy variant="light" className="mt-3" />
                </div>
              ) : stripeCheckout && allStripeReady && !isAuthenticated ? null : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4 text-sm text-slate-600">
                  {stripeCheckout
                    ? 'Online payment is unavailable for these items. Contact us for a quote.'
                    : 'Demo mode — Stripe is not configured on this server.'}
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-bold mb-4">
                <span>Total</span>
                <span className="text-primary text-lg">${total.toFixed(2)}</span>
              </div>

              {!canStripe ? (
                <button type="button" onClick={() => setStep(3)} className="w-full border border-slate-300 text-slate-700 py-2.5 rounded-xl text-sm">
                  Demo: mark order placed
                </button>
              ) : null}
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-bingo-dark text-lg mb-2">Order Placed!</p>
              <p className="text-sm text-slate-600 mb-4">Thank you for your purchase. View orders in your profile.</p>
              <Link to="/profile#orders" className="btn-primary px-6 py-2 inline-block mr-2">My Orders</Link>
              <button type="button" onClick={onClose} className="text-sm px-4 py-2 rounded-xl border border-slate-300 mt-2">Back to Mall</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export default function Mall() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { content } = useMallContent()
  const { visibleMallLineTabs, isLineVisible, loading: visibilityLoading } = useProductLineVisibility()
  const [courses, setCourses] = useState(COURSES_FALLBACK)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [tab, setTab] = useState(() => {
    const fromUrl = searchParams.get('tab')
    return MALL_STOREFRONT_TABS.some((t) => t.id === fromUrl) ? fromUrl : 'home'
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState(null)
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [bookingModal, setBookingModal] = useState(null)
  const [points] = useState(1280)
  const [certProducts, setCertProducts] = useState(CERT_PRODUCTS)
  const [materialProducts, setMaterialProducts] = useState(MATERIALS)
  const [labProducts, setLabProducts] = useState(AI_LAB)
  const [trainingProducts, setTrainingProducts] = useState(AI_TRAINING)
  const [eventsProducts, setEventsProducts] = useState(EVENTS_PRODUCTS)

  const addToCart = (item) => setCart((c) => [...c, { ...item, quantity: 1 }])
  const buyNow = (item) => {
    setCart([{ ...item, quantity: 1 }])
    setCheckoutOpen(true)
  }
  const cartCount = cart.length

  const mapMallProduct = (r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    tag: r.tag,
    price: r.price != null ? Number(r.price) : null,
    bPrice: r.b_price,
    desc: r.desc,
    deadline: r.deadline,
    mall_tab: r.mall_tab || null,
    featured_home: !!r.featured_home,
    source: 'mall_products',
  })

  useEffect(() => {
    fetchPaymentsConfig()
      .then((cfg) => setStripeCheckout(Boolean(cfg.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  useEffect(() => {
    const status = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')
    if (status === 'success' && sessionId && isAuthenticated) {
      confirmCheckoutSession(sessionId)
        .then(() => {
          setCheckoutMessage('Payment successful — your order is confirmed!')
          setCart([])
        })
        .catch(() => {
          setCheckoutMessage('Payment received — your order will appear shortly.')
        })
        .finally(() => {
          searchParams.delete('checkout')
          searchParams.delete('session_id')
          setSearchParams(searchParams, { replace: true })
        })
    } else if (status === 'canceled') {
      setCheckoutMessage('Checkout canceled.')
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, isAuthenticated])

  const handleStripePay = async (cartItems) => {
    if (!isAuthenticated) {
      navigate(authLink('/login', '/mall'))
      return
    }
    setCheckoutLoading(true)
    try {
      const items = cartItems.map((item) => ({
        id: item.id,
        source: item.source,
        quantity: item.quantity || 1,
      }))
      const { url } = await startMallCheckout({ items })
      if (url) window.location.href = url
    } catch (err) {
      alert(err.message || 'Checkout failed')
      setCheckoutLoading(false)
    }
  }

  useEffect(() => {
    supabase.from('courses').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setCoursesLoading(false)
        if (!error && data?.length > 0) setCourses(data.map(courseFromDb))
      })
      .catch(() => setCoursesLoading(false))
  }, [])
  useEffect(() => {
    supabase.from('mall_products').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) {
        const by = (t) => data.filter((r) => r.type === t).map(mapMallProduct)
        if (by('cert').length) setCertProducts(by('cert'))
        if (by('material').length) setMaterialProducts(by('material'))
        if (by('lab').length) setLabProducts(by('lab'))
        if (by('training').length) setTrainingProducts(by('training'))
        if (by('event').length) setEventsProducts(by('event'))
      }
    })
  }, [])

  useEffect(() => {
    const fromUrl = searchParams.get('tab')
    if (fromUrl && visibleMallLineTabs.some((t) => t.id === fromUrl) && fromUrl !== tab) {
      setTab(fromUrl)
    }
  }, [searchParams, tab, visibleMallLineTabs])

  useEffect(() => {
    if (visibilityLoading) return
    if (['ioai', 'general', 'k12'].includes(tab) && !isLineVisible(tab)) {
      setTab('home')
      const next = new URLSearchParams(searchParams)
      next.delete('tab')
      setSearchParams(next, { replace: true })
    }
  }, [visibilityLoading, tab, isLineVisible, searchParams, setSearchParams])

  const ioaiCourses = useMemo(() => filterMallCoursesForTab(courses, 'ioai').filter(isRetail), [courses])
  const generalCourses = useMemo(() => filterMallCoursesForTab(courses, 'general').filter(isRetail), [courses])
  const ioaiEvents = useMemo(() => filterMallProductsForTab(eventsProducts, 'ioai').filter(isRetail), [eventsProducts])
  const k12Products = useMemo(
    () => [...filterMallProductsForTab(materialProducts, 'k12'), ...filterMallProductsForTab(trainingProducts, 'k12')].filter(isRetail),
    [materialProducts, trainingProducts]
  )
  const certItems = useMemo(() => filterMallProductsForTab(certProducts, 'cert').filter(isRetail), [certProducts])
  const materialItems = useMemo(() => filterMallProductsForTab(materialProducts, 'materials').filter(isRetail), [materialProducts])
  const labItems = useMemo(() => filterMallProductsForTab(labProducts, 'lab').filter(isRetail), [labProducts])
  const flashDeals = useMemo(
    () =>
      filterMallFlashDealItems({
        courses,
        products: [...materialProducts, ...labProducts, ...certProducts, ...eventsProducts, ...trainingProducts],
        limit: content.tabs.home?.flashDeals?.limit ?? 6,
      }),
    [courses, materialProducts, labProducts, certProducts, eventsProducts, trainingProducts, content.tabs.home?.flashDeals?.limit]
  )

  const handleCtaAction = (action) => {
    if (!action) return
    if (action.startsWith('tab:')) {
      setTab(action.slice(4))
      return
    }
    if (action.startsWith('link:')) {
      navigate(action.slice(5))
    }
  }

  const tabPanel = (tabId) => getMallTabContent(content, tabId)
  const homePanel = tabPanel('home')

  const TABS = visibleMallLineTabs

  return (
    <div className="w-full">
      <PageContent className="py-6 sm:py-8">

      {selectedProduct && (
        <ProductModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onCart={addToCart}
          onBuy={buyNow}
          sellingPoints={content.productModal?.sellingPoints}
        />
      )}
      {bookingModal && <BookingModal title={bookingModal} onClose={() => setBookingModal(null)} />}
      {checkoutOpen ? (
        <CheckoutModal
          items={cart}
          onClose={() => {
            setCheckoutOpen(false)
            setCart([])
          }}
          stripeCheckout={stripeCheckout}
          isAuthenticated={isAuthenticated}
          onStripePay={handleStripePay}
          checkoutLoading={checkoutLoading}
        />
      ) : null}

      {checkoutMessage ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {checkoutMessage}
        </div>
      ) : null}

      {/* Cart sidebar trigger */}
      {cartCount > 0 && !checkoutOpen && (
        <button onClick={() => setCheckoutOpen(true)}
          className="fixed z-40 bg-primary text-white rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm font-semibold hover:bg-primary/90 transition min-h-[44px]"
          style={{ bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 4rem))', right: 'max(1rem, env(safe-area-inset-right))' }}>
          🛒 Cart ({cartCount})
        </button>
      )}

      <section className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-slate-600">{content.intro.text}</p>
          {content.intro.showPoints ? (
            <div className="flex gap-3 text-xs text-slate-500 items-center">
              <span>🪙 <strong className="text-primary">{points.toLocaleString()}</strong> points</span>
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {content.stats.map((stat, i) => (
            <div key={i} className="card p-3 sm:p-4 text-center">
              <div className="font-bold text-primary text-sm sm:text-base">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="nav-scroll-mobile mb-6 sm:flex sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1 min-h-[44px] ${tab===t.id?'bg-primary text-white shadow':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ MALL HOME ══════════════════ */}
      {tab === 'home' && (
        <div className="space-y-8">
          {/* Flash deals */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">{homePanel.flashDeals?.title}</h2>
              <span className="text-xs text-slate-400">{homePanel.flashDeals?.subtitle}</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {flashDeals.map((item, i) => (
                <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
              ))}
            </div>
          </section>

          {/* Brand trust */}
          <section className="card p-5 bg-slate-50 border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 text-center">{homePanel.trust?.title}</p>
            <div className="grid sm:grid-cols-4 gap-3 text-center text-xs">
              {(homePanel.trust?.items ?? []).map(({ icon, title, desc }, i) => (
                <div key={i}><div className="text-2xl mb-1">{icon}</div><p className="font-semibold text-bingo-dark mb-0.5">{title}</p><p className="text-slate-500">{desc}</p></div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === 'general' && (
        <div className="space-y-5">
          <div className={`card p-4 ${tabPanel('general').header?.cardClass || ''}`}>
            <h2 className="font-bold text-bingo-dark mb-1">{tabPanel('general').header?.title}</h2>
            <p className="text-slate-500 text-sm">{tabPanel('general').header?.desc}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {generalCourses.map((item, i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
            {materialItems.slice(0, tabPanel('general').materialPreviewCount ?? 2).map((item, i) => (
              <ProductCard key={`m-${i}`} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          {tabPanel('general').footerLink?.href ? (
            <Link to={tabPanel('general').footerLink.href} className="text-sm text-primary hover:underline">{tabPanel('general').footerLink.text}</Link>
          ) : null}
        </div>
      )}

      {tab === 'ioai' && (
        <div className="space-y-5">
          <div className={`card p-4 ${tabPanel('ioai').header?.cardClass || ''}`}>
            <h2 className="font-bold text-bingo-dark mb-1">{tabPanel('ioai').header?.title}</h2>
            <p className="text-slate-500 text-sm">{tabPanel('ioai').header?.desc}</p>
          </div>
          <IoaiMallPackageGrid />
          {(ioaiEvents.length > 0 || ioaiCourses.length > 0) ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {ioaiEvents.map((item, i) => (
                <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
              ))}
              {ioaiCourses.map((item, i) => (
                <ProductCard key={`c-${i}`} item={item} onOpen={setSelectedProduct} />
              ))}
            </div>
          ) : null}
          {tabPanel('ioai').footerLink?.href ? (
            <Link to={tabPanel('ioai').footerLink.href} className="text-sm text-primary hover:underline">{tabPanel('ioai').footerLink.text}</Link>
          ) : null}
        </div>
      )}

      {tab === 'k12' && (
        <div className="space-y-5">
          <div className={`card p-4 ${tabPanel('k12').header?.cardClass || ''}`}>
            <h2 className="font-bold text-bingo-dark mb-1">{tabPanel('k12').header?.title}</h2>
            <p className="text-slate-500 text-sm">{tabPanel('k12').header?.desc}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {k12Products.map((item, i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          {tabPanel('k12').footerLink?.href ? (
            <Link to={tabPanel('k12').footerLink.href} className="text-sm text-primary hover:underline">{tabPanel('k12').footerLink.text}</Link>
          ) : null}
        </div>
      )}

      {/* ══════════════════ COURSES (legacy tab id) ══════════════════ */}
      {tab === 'courses' && (
        <div className="space-y-5">
          <div className="card p-4 bg-primary/5 border-primary/20">
            <h2 className="font-bold text-bingo-dark mb-1">🎓 AI Courses</h2>
            <p className="text-slate-500 text-sm">Curriculum matched to the Bingo 9-star framework. Competition prep, foundations, AIGC, and parent series.</p>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            {['All','Competition Prep','Foundations','AIGC','Parent Series'].map((f,i) => (
              <button key={i} className={`px-3 py-1.5 rounded-xl font-medium transition ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coursesLoading ? <div className="col-span-full text-center py-8 text-slate-500">Loading...</div> : courses.filter(isRetail).map((item,i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div className="p-4 text-center">
          <Link to="/courses/ioai" className="text-primary hover:underline">IOAI training moved to IOAI tab →</Link>
        </div>
      )}

      {/* ══════════════════ CERTIFICATION ══════════════════ */}
      {tab === 'cert' && (
        <div className="space-y-5">
          <div className={`card p-4 ${tabPanel('cert').header?.cardClass || ''}`}>
            <h2 className="font-bold text-bingo-dark mb-1">{tabPanel('cert').header?.title}</h2>
            <p className="text-slate-500 text-sm">{tabPanel('cert').header?.desc}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {certItems.map((item, i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          {tabPanel('cert').cta ? (
            <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-700">{tabPanel('cert').cta.text}</p>
              <Link to={tabPanel('cert').cta.href || '/cert'} className="btn-primary text-xs px-4 py-2">{tabPanel('cert').cta.buttonText}</Link>
            </div>
          ) : null}
        </div>
      )}

      {tab === 'materials' && (
        <div className="space-y-5">
          <div className={`card p-4 ${tabPanel('materials').header?.cardClass || ''}`}>
            <h2 className="font-bold text-bingo-dark mb-1">{tabPanel('materials').header?.title}</h2>
            <p className="text-slate-500 text-sm">{tabPanel('materials').header?.desc}</p>
          </div>
          <div className="flex gap-2 text-xs flex-wrap">
            {(tabPanel('materials').filterLabels ?? []).map((f, i) => (
              <button key={i} className={`px-3 py-1.5 rounded-xl font-medium transition ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {materialItems.map((item, i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ AI LAB ══════════════════ */}
      {tab === 'lab' && (
        <div className="space-y-5">
          <div className={`card p-4 ${tabPanel('lab').header?.cardClass || ''}`}>
            <h2 className="font-bold text-bingo-dark mb-1">{tabPanel('lab').header?.title}</h2>
            <p className="text-slate-600 text-sm">{tabPanel('lab').header?.desc}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {labItems.map((item, i) => (
              <ProductCard key={i} item={item} onOpen={setSelectedProduct} />
            ))}
          </div>
          <div className="card p-5 grid sm:grid-cols-3 gap-3 text-xs">
            {(tabPanel('lab').features ?? []).map(({ icon, title, desc }, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3"><div className="text-xl mb-1">{icon}</div><p className="font-semibold text-bingo-dark mb-0.5">{title}</p><p className="text-slate-500">{desc}</p></div>
            ))}
          </div>
          {tabPanel('lab').bookingButton ? (
            <button type="button" onClick={() => setBookingModal(tabPanel('lab').bookingTitle || tabPanel('lab').bookingButton)} className="w-full border border-primary text-primary py-2.5 rounded-xl font-medium text-sm hover:bg-primary/5 transition">{tabPanel('lab').bookingButton}</button>
          ) : null}
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
            {trainingProducts.map((item,i) => (
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

      {/* ── Bottom CTA ── */}
      <div className="mt-10 card p-5 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">{content.bottomCta.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{content.bottomCta.desc}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(content.bottomCta.buttons ?? []).map((btn, i) => {
            const className =
              btn.style === 'amber'
                ? 'bg-amber-500 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-amber-600 transition min-h-[44px]'
                : btn.style === 'outline'
                  ? 'border border-slate-300 text-slate-600 text-sm px-4 py-2.5 rounded-xl hover:bg-slate-50 transition min-h-[44px] inline-flex items-center'
                  : 'btn-primary text-sm px-4 py-2.5 min-h-[44px]'
            if (btn.action?.startsWith('link:')) {
              return (
                <Link key={i} to={btn.action.slice(5)} className={className}>
                  {btn.label}
                </Link>
              )
            }
            return (
              <button key={i} type="button" onClick={() => handleCtaAction(btn.action)} className={className}>
                {btn.label}
              </button>
            )
          })}
        </div>
      </div>
      </PageContent>
    </div>
  )
}
