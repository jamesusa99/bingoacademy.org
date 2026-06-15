import { supabase, isSupabaseConfigured } from './supabase'

export async function fetchPlatformSetting(key) {
  if (!isSupabaseConfigured || !key) return null
  const { data, error } = await supabase.from('platform_settings').select('value').eq('key', key).maybeSingle()
  if (error) throw new Error(error.message)
  return data?.value ?? null
}

export async function upsertPlatformSetting(key, value) {
  if (!isSupabaseConfigured || !key) {
    throw new Error('Supabase is not configured')
  }
  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select('key, value, updated_at')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}
