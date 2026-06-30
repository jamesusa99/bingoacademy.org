import { useMemo, useState } from 'react'
import { formatIoaiPrice } from '../../lib/ioaiStore'
import RichHtmlContent from '../shared/RichHtmlContent'

function BundleDiscountTags({ item, className = '' }) {
  const tags = useMemo(() => {
    const list = [...(item.marketingTags || [])]
    if (item.discountPercent > 0 && !list.some((tag) => /save/i.test(tag))) {
      list.unshift(`Save ${item.discountPercent}%`)
    }
    return list
  }, [item.discountPercent, item.marketingTags])

  if (!tags.length) return null

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export default function IoaiCourseBundleModal({ item, onClose, onBuy, buying = false }) {
  if (!item) return null

  const compare =
    item.compareAtCents != null ? formatIoaiPrice(item.compareAtCents, item.currency) : null
  const price = formatIoaiPrice(item.priceCents, item.currency)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {item.coverUrl?.trim() ? (
          <div className="aspect-[2/1] w-full bg-slate-100">
            <img src={item.coverUrl.trim()} alt="" className="w-full h-full object-cover" />
          </div>
        ) : null}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {!item.coverUrl?.trim() ? (
                  <span className="text-3xl" aria-hidden>
                    {item.emoji || '🏆'}
                  </span>
                ) : null}
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  {item.isFullTrack ? 'Full track' : 'Stage bundle'}
                </span>
              </div>
              <h3 className="font-bold text-bingo-dark text-xl leading-snug">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {item.moduleCount} unit{item.moduleCount === 1 ? '' : 's'} · {item.lessonCount} lesson
                {item.lessonCount === 1 ? '' : 's'}
              </p>
              <BundleDiscountTags item={item} className="mt-2" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none shrink-0"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex items-end gap-3 mb-5">
            {compare ? <p className="text-sm text-slate-400 line-through">{compare}</p> : null}
            <p className="text-2xl font-bold text-amber-700">{price}</p>
            {item.listPriceCents > item.priceCents ? (
              <p className="text-xs text-slate-500 pb-1">
                List price {formatIoaiPrice(item.listPriceCents, item.currency)}
              </p>
            ) : null}
          </div>

          {item.introHtml ? (
            <div className="prose prose-sm max-w-none text-slate-700 mb-6 border-t border-slate-100 pt-5">
              <RichHtmlContent html={item.introHtml} theme="light" className="w-full" />
            </div>
          ) : (
            <p className="text-sm text-slate-600 mb-6 border-t border-slate-100 pt-5">{item.desc}</p>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onBuy?.(item)}
              disabled={buying}
              className="flex-1 min-w-[140px] btn-primary text-sm py-2.5 disabled:opacity-60"
            >
              {buying ? 'Redirecting…' : `Buy now — ${price}`}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function IoaiCourseBundleCard({
  item,
  onOpen,
  onBuy,
  buying = false,
  theme = 'light',
}) {
  const compare =
    item.compareAtCents != null ? formatIoaiPrice(item.compareAtCents, item.currency) : null
  const price = formatIoaiPrice(item.priceCents, item.currency)
  const isDark = theme === 'dark'
  const hasCover = Boolean(item.coverUrl?.trim())

  return (
    <article
      className={`group flex flex-col h-full cursor-pointer transition ${
        isDark
          ? 'course-card-dark ring-2 ring-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900'
          : 'card border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-orange-50/40 hover:shadow-md hover:border-amber-300'
      }`}
      onClick={() => onOpen?.(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.(item)
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={isDark ? 'relative p-4 pb-0' : 'p-4 pb-0'}>
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-lg min-h-[120px] ${
            isDark
              ? 'course-card-dark__thumb bg-gradient-to-br from-amber-500/90 via-orange-600/80 to-amber-950'
              : 'bg-gradient-to-br from-amber-100 to-orange-100 h-24'
          }`}
        >
          {hasCover ? (
            <img src={item.coverUrl.trim()} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="text-4xl" aria-hidden>
              {item.emoji || '🏆'}
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${isDark ? 'p-4' : 'px-4 pb-4'}`}>
        <BundleDiscountTags item={item} className="mb-2" />
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              isDark ? 'text-amber-300 bg-amber-500/15' : 'text-amber-900 bg-amber-100'
            }`}
          >
            {item.isFullTrack ? 'Full track' : 'Stage bundle'}
          </span>
        </div>
        <h3
          className={`font-semibold text-sm leading-snug mb-1 ${
            isDark ? 'text-white group-hover:text-cyan-300' : 'text-bingo-dark'
          }`}
        >
          {item.name}
        </h3>
        <p className="text-[10px] text-slate-500 mb-2">
          {item.moduleCount} unit{item.moduleCount === 1 ? '' : 's'} · {item.lessonCount} lesson
          {item.lessonCount === 1 ? '' : 's'}
        </p>
        <p className={`text-xs leading-relaxed flex-1 mb-4 line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {item.desc}
        </p>
        <div
          className={`flex items-center justify-between gap-2 pt-3 mt-auto ${
            isDark ? 'border-t border-amber-500/20' : 'border-t border-amber-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            {compare ? <p className="text-[10px] text-slate-400 line-through">{compare}</p> : null}
            <span className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{price}</span>
          </div>
          <button
            type="button"
            onClick={() => onBuy?.(item)}
            disabled={buying}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60 ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                : 'bg-amber-500 hover:bg-amber-400 text-white'
            }`}
          >
            {buying ? '…' : 'Buy now'}
          </button>
        </div>
      </div>
    </article>
  )
}

export function IoaiCourseBundleCards({
  items,
  theme = 'light',
  gridClass = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4',
  onBuy,
  buyingSlug = null,
}) {
  const [selected, setSelected] = useState(null)

  if (!items?.length) return null

  return (
    <>
      {selected ? (
        <IoaiCourseBundleModal
          item={selected}
          onClose={() => setSelected(null)}
          onBuy={(item) => onBuy?.(item)}
          buying={buyingSlug === selected.ioaiBundleSlug}
        />
      ) : null}
      <div className={gridClass}>
        {items.map((item) => (
          <IoaiCourseBundleCard
            key={item.id}
            item={item}
            theme={theme}
            onOpen={setSelected}
            onBuy={onBuy}
            buying={buyingSlug === item.ioaiBundleSlug}
          />
        ))}
      </div>
    </>
  )
}
