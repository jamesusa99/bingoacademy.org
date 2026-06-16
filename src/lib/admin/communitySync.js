import { COMMUNITY_PARTNERS } from '../../config/seed/communityContent'
import { mapPartnerRow } from '../communityContent'
import { supabase } from '../supabase'
import { adminInsert } from './db'

export function fallbackCommunityPartners() {
  return COMMUNITY_PARTNERS.map((row, index) =>
    mapPartnerRow({ ...row, id: `fallback-partner-${index}`, sort_order: row.sort_order ?? index })
  ).filter(Boolean)
}

/** If community_partners is empty, seed rows from storefront defaults. */
export async function ensureCommunityPartnersSeeded() {
  const { data, error } = await supabase.from('community_partners').select('id').limit(1)
  if (error) throw error
  if (data?.length) return { seeded: false, count: 0 }

  for (const row of COMMUNITY_PARTNERS) {
    await adminInsert('community_partners', row)
  }
  return { seeded: true, count: COMMUNITY_PARTNERS.length }
}

export async function importCommunityPartnersDefaults() {
  const { data } = await supabase.from('community_partners').select('id').limit(1)
  if (data?.length) {
    return { imported: false, count: 0, reason: 'already_populated' }
  }
  return ensureCommunityPartnersSeeded().then((r) => ({ imported: r.seeded, count: r.count }))
}
