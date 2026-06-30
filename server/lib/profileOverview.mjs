import { listEnrollmentSlugs } from './courseEntitlements.mjs'

const LAB_SUBS = ['training-lab', 'online-lab', 'online-lab-kit', 'offline-lab-kit', 'materials-pack']

function parseMallItems(metadata) {
  if (!metadata || typeof metadata !== 'object') return []
  const raw = metadata.mall_items
  if (!raw) return []
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function countEventsJoined(admin, paidOrders) {
  if (!paidOrders.length) return 0

  const mallProductIds = []
  for (const order of paidOrders) {
    if (metadataPurchaseType(order.metadata) !== 'mall') continue
    for (const item of parseMallItems(order.metadata)) {
      if (item?.source === 'mall_products' && item?.id) {
        mallProductIds.push(item.id)
      }
    }
  }

  if (!mallProductIds.length) return 0

  const uniqueIds = [...new Set(mallProductIds)]
  const { data, error } = await admin
    .from('mall_products')
    .select('id, type')
    .in('id', uniqueIds)

  if (error) return 0
  return (data || []).filter((row) => row.type === 'event').length
}

function metadataPurchaseType(metadata) {
  if (!metadata || typeof metadata !== 'object') return null
  return metadata.purchase_type || metadata.purchaseType || null
}

export async function buildProfileOverview(admin, userId) {
  if (!admin || !userId) {
    return null
  }

  const enrolled = await listEnrollmentSlugs(admin, userId)

  const [
    ordersRes,
    certsRes,
    achievementsRes,
    assessmentRes,
    labCatalogRes,
    labBundlesRes,
  ] = await Promise.all([
    admin
      .from('orders')
      .select('id, status, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200),
    admin
      .from('user_certificates')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    admin.from('user_achievements').select('id, category').eq('user_id', userId),
    admin
      .from('assessment_results')
      .select('level, score, total, assessment_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    enrolled.length
      ? admin
          .from('courses_catalog')
          .select('slug')
          .in('slug', enrolled)
          .in('sub', LAB_SUBS)
      : Promise.resolve({ data: [] }),
    admin
      .from('ioai_bundles')
      .select('slug')
      .eq('bundle_type', 'lab_pack')
      .in('slug', enrolled.length ? enrolled : ['__none__']),
  ])

  const orders = ordersRes.data || []
  const paidOrders = orders.filter((row) => row.status === 'paid')
  const achievements = achievementsRes.data || []
  const awardsWorksCount = achievements.length
  const labPackCount = (labCatalogRes.data?.length || 0) + (labBundlesRes.data?.length || 0)
  const eventsJoined = await countEventsJoined(admin, paidOrders)

  return {
    ordersCount: orders.length,
    paidOrdersCount: paidOrders.length,
    certificatesCount: certsRes.count || 0,
    awardsWorksCount,
    eventsJoined,
    teachingKitCount: labPackCount,
    capabilityLevel: assessmentRes.data?.level || null,
    assessmentScore: assessmentRes.data
      ? { score: assessmentRes.data.score, total: assessmentRes.data.total }
      : null,
    enrollmentCount: enrolled.length,
    charityPoints: 0,
    commissionBalanceCents: 0,
    pendingCommissionCents: 0,
    invitedCount: 0,
    memberBenefitsToClaim: 0,
  }
}
