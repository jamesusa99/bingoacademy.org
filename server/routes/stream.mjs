import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import {
  fetchStreamVideo,
  isStreamConfigured,
  streamVideoToPlayback,
  syncStreamPlayback,
} from '../lib/cloudflareStream.mjs'

async function applyPlaybackToCatalog(admin, catalogSlug, playback) {
  const patch = {
    cloudflare_uid: playback.uid,
    video_url: playback.hlsUrl,
    video_poster: playback.thumbnailUrl,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await admin
    .from('courses_catalog')
    .update(patch)
    .eq('slug', catalogSlug)
    .select()
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, error: `Course not found: ${catalogSlug}` }
  return { ok: true, course: data }
}

async function applyPlaybackToAsset(admin, videoAssetId, playback, catalogSlug = null) {
  const patch = {
    cloudflare_uid: playback.uid,
    playback_url: playback.hlsUrl,
    thumbnail_url: playback.thumbnailUrl,
    duration_seconds: playback.durationSeconds,
    status: playback.ready ? 'ready' : 'processing',
    updated_at: new Date().toISOString(),
  }
  if (catalogSlug) patch.catalog_slug = catalogSlug

  const { data, error } = await admin
    .from('video_assets')
    .update(patch)
    .eq('id', videoAssetId)
    .select()
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, error: 'Video asset not found' }
  return { ok: true, asset: data }
}

export function registerStreamRoutes(app, { verifyAdminUser }) {
  app.post('/api/admin/stream/sync', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    if (!isStreamConfigured()) {
      return res.status(503).json({ error: 'Cloudflare Stream not configured' })
    }

    const { uid, videoAssetId, wait = true } = req.body || {}
    let cloudflareUid = uid?.trim()

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Supabase service role not configured' })

    if (!cloudflareUid && videoAssetId) {
      const { data: asset } = await admin
        .from('video_assets')
        .select('cloudflare_uid')
        .eq('id', videoAssetId)
        .maybeSingle()
      cloudflareUid = asset?.cloudflare_uid
    }

    if (!cloudflareUid) {
      return res.status(400).json({ error: 'uid or videoAssetId with cloudflare_uid is required' })
    }

    let syncResult
    if (wait) {
      syncResult = await syncStreamPlayback(cloudflareUid)
    } else {
      const fetched = await fetchStreamVideo(cloudflareUid)
      syncResult = fetched.ok
        ? { ok: true, playback: streamVideoToPlayback(fetched.video), video: fetched.video }
        : fetched
    }

    if (!syncResult.ok) {
      return res.status(502).json({ error: syncResult.error })
    }

    const { playback, pending, message } = syncResult

    if (videoAssetId) {
      const assetResult = await applyPlaybackToAsset(admin, videoAssetId, playback)
      if (!assetResult.ok) return res.status(400).json({ error: assetResult.error })
    }

    return res.json({
      playback,
      pending: pending || !playback.ready,
      message: message || (playback.ready ? 'Playback URLs synced' : 'Video still processing'),
    })
  })

  app.post('/api/admin/stream/assign', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    if (!isStreamConfigured()) {
      return res.status(503).json({ error: 'Cloudflare Stream not configured' })
    }

    const { catalogSlug, uid, videoAssetId } = req.body || {}
    if (!catalogSlug?.trim()) {
      return res.status(400).json({ error: 'catalogSlug is required' })
    }

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Supabase service role not configured' })

    let cloudflareUid = uid?.trim()
    let assetId = videoAssetId

    if (!cloudflareUid && assetId) {
      const { data: asset } = await admin.from('video_assets').select('*').eq('id', assetId).maybeSingle()
      if (!asset) return res.status(404).json({ error: 'Video asset not found' })
      cloudflareUid = asset.cloudflare_uid
    }

    if (!cloudflareUid) {
      return res.status(400).json({ error: 'uid or videoAssetId is required' })
    }

    const syncResult = await syncStreamPlayback(cloudflareUid)
    if (!syncResult.ok) {
      return res.status(502).json({ error: syncResult.error })
    }

    const { playback, pending, message } = syncResult

    if (assetId) {
      await applyPlaybackToAsset(admin, assetId, playback, catalogSlug.trim())
    } else {
      const { data: existing } = await admin
        .from('video_assets')
        .select('id')
        .eq('cloudflare_uid', cloudflareUid)
        .maybeSingle()
      if (existing?.id) {
        assetId = existing.id
        await applyPlaybackToAsset(admin, assetId, playback, catalogSlug.trim())
      }
    }

    const catalogResult = await applyPlaybackToCatalog(admin, catalogSlug.trim(), playback)
    if (!catalogResult.ok) {
      return res.status(400).json({ error: catalogResult.error })
    }

    return res.json({
      course: catalogResult.course,
      playback,
      pending: pending || !playback.ready,
      message: message || 'Video assigned to course',
    })
  })

  app.post('/api/webhooks/cloudflare-stream', async (req, res) => {
    const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET
    if (secret) {
      const header = req.headers['webhook-signature'] || req.headers['x-webhook-signature']
      if (header !== secret) {
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }
    }

    const body = req.body || {}
    const uid = body.uid || body.video?.uid
    if (!uid) {
      return res.status(400).json({ error: 'Missing uid' })
    }

    const admin = getSupabaseAdmin()
    if (!admin || !isStreamConfigured()) {
      return res.json({ ok: true, skipped: true })
    }

    const { ok, video } = await fetchStreamVideo(uid)
    if (!ok) {
      return res.status(502).json({ error: 'Failed to fetch video from Cloudflare' })
    }

    const playback = streamVideoToPlayback(video)

    const { data: assets } = await admin.from('video_assets').select('id, catalog_slug').eq('cloudflare_uid', uid)
    for (const asset of assets || []) {
      await applyPlaybackToAsset(admin, asset.id, playback, asset.catalog_slug)
      if (asset.catalog_slug) {
        await applyPlaybackToCatalog(admin, asset.catalog_slug, playback)
      }
    }

    const { data: courses } = await admin.from('courses_catalog').select('slug').eq('cloudflare_uid', uid)
    for (const course of courses || []) {
      await applyPlaybackToCatalog(admin, course.slug, playback)
    }

    return res.json({ ok: true, uid, ready: playback.ready })
  })
}
