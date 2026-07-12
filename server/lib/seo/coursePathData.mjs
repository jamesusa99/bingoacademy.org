/** Lab subcategory ids per product line — shared with course path routing */

export const PRODUCT_LAB_MODULE_IDS = {
  general: ['online-lab', 'materials-pack'],
  ioai: ['training-lab', 'online-lab', 'online-lab-kit', 'offline-lab', 'offline-lab-kit'],
  k12: ['online-lab', 'materials-pack', 'offline-lab', 'school-kit'],
}

export function isProductLabSub(lineId, subId) {
  return (PRODUCT_LAB_MODULE_IDS[lineId] || []).includes(subId)
}

export function labsPath(lineId, subId) {
  const params = new URLSearchParams()
  if (lineId) params.set('line', lineId)
  if (subId) params.set('sub', subId)
  const q = params.toString()
  return q ? `/labs?${q}` : '/labs'
}
