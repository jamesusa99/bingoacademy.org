export default function PriceTag({ price, isFree, comingSoon, priceUnknown }) {
  if (comingSoon || priceUnknown) {
    return <span className="text-sm font-semibold text-slate-400">Coming soon</span>
  }
  if (isFree) {
    return <span className="text-xl font-bold text-emerald-400">Free</span>
  }
  if (typeof price === 'number') {
    return <span className="text-xl font-bold text-white">${price.toFixed(2)}</span>
  }
  return <span className="text-lg font-bold text-white">{price}</span>
}
