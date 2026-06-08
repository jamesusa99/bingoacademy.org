import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import {
  fetchStreamVideo,
  isStreamConfigured,
  isStreamSigningConfigured,
  signStreamToken,
  streamVideoToPlayback,
  syncStreamPlayback,
} from '../lib/cloudflareStream.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { listEnrollmentSlugs } from '../lib/courseEntitlements.mjs'
import { userHasLessonAccess } from '../lib/ioaiCommerce.mjs'

async function applyPlaybackToCatalog(admin, catalogSlug, playback) {
  const patch = {
    cloudflare_uid: playback.uid,
    updated_at: new Date().toISOString(),
  }
  if (playback.ready && playback.hlsUrl) {
    patch.video_url = playback.hlsUrl
    patch.video_poster = playback.thumbnailUrl
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

async function applyPlaybackToAsset(admin, videoAssetId, playback, catalogSlug) {
  const patch = {
    cloudflare_uid: playback.uid,
    duration_seconds: playback.durationSeconds,
    status: playback.ready ? 'ready' : playback.state === 'error' ? 'error' : 'processing',
    updated_at: new Date().toISOString(),
  }
  if (playback.ready && playback.hlsUrl) {
    patch.playback_url = playback.hlsUrl
    patch.thumbnail_url = playback.thumbnailUrl
  }
  if (typeof catalogSlug === 'string' && catalogSlug.trim()) {
    patch.catalog_slug = catalogSlug.trim()
  }

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

async function linkLessonVideo(admin, catalogSlug, cloudflareUid) {
  if (!catalogSlug?.trim() || !cloudflareUid?.trim()) return
  const slug = catalogSlug.trim()
  const uid = cloudflareUid.trim()
  const patch = {
    cloudflare_video_id: uid,
    updated_at: new Date().toISOString(),
  }
  await admin.from('lessons').update(patch).eq('slug', slug)
  await admin.from('lessons').update(patch).eq('catalog_slug', slug)
}

export function registerStreamRoutes(app, { verifyAdminUser }) {
  /** Signed playback token — requires auth + course access */
  app.post('/api/video/token', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const { cloudflareVideoId, cloudflare_video_id, lessonSlug } = req.body || {}
    const videoId = (cloudflareVideoId || cloudflare_video_id || '').trim()
    if (!videoId) return res.status(400).json({ error: 'cloudflareVideoId is required' })

    const admin = auth.admin
    const slugs = await listEnrollmentSlugs(admin, auth.user.id)
    const slug = lessonSlug?.trim()
    const adminPreview = Boolean(req.body?.adminPreview)

    if (adminPreview) {
      const adminAuth = await verifyAdminUser(req)
      if (!adminAuth.ok) {
        return res.status(adminAuth.status).json({ error: adminAuth.error })
      }
    } else {
      const allowed = slug
        ? await userHasLessonAccess(admin, auth.user.id, slug, { enrolledSlugs: slugs })
        : false

      if (!allowed) {
        return res.status(403).json({ error: 'Purchase the unit or full track to watch this lesson' })
      }
    }

    if (isStreamSigningConfigured()) {
      const token = signStreamToken(videoId)
      if (token) {
        return res.json({ token, videoId, signed: true })
      }
    }

    return res.json({
      token: null,
      videoId,
      signed: false,
      iframeSrc: `https://iframe.cloudflarestream.com/${encodeURIComponent(videoId)}`,
    })
  })

  app.post('/api/admin/stream/sync', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    if (!isStreamConfigured()) {
      return res.status(503).json({ error: 'Cloudflare Stream not configured' })
    }

    const { uid, videoAssetId, wait = true, catalogSlug: catalogSlugInput } = req.body || {}
    let cloudflareUid = uid?.trim()

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Supabase service role not configured' })

    let resolvedCatalogSlug = catalogSlugInput?.trim() || null

    if (!cloudflareUid && videoAssetId) {
      const { data: asset } = await admin
        .from('video_assets')
        .select('cloudflare_uid, catalog_slug')
        .eq('id', videoAssetId)
        .maybeSingle()
      cloudflareUid = asset?.cloudflare_uid
      if (!resolvedCatalogSlug) resolvedCatalogSlug = asset?.catalog_slug?.trim() || null
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
      const assetResult = await applyPlaybackToAsset(
        admin,
        videoAssetId,
        playback,
        resolvedCatalogSlug || undefined
      )
      if (!assetResult.ok) return res.status(400).json({ error: assetResult.error })
    }

    if (resolvedCatalogSlug) {
      const catalogResult = await applyPlaybackToCatalog(admin, resolvedCatalogSlug, playback)
      if (!catalogResult.ok) return res.status(400).json({ error: catalogResult.error })
      await linkLessonVideo(admin, resolvedCatalogSlug, playback.uid)
    }

    return res.json({
      playback,
      pending: pending || !playback.ready,
      message:
        message ||
        (resolvedCatalogSlug
          ? `Playback synced and linked to ${resolvedCatalogSlug}`
          : playback.ready
            ? 'Playback URLs synced'
            : 'Video still processing'),
      catalogSlug: resolvedCatalogSlug,
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
    const slug = catalogSlug.trim()

    if (assetId) {
      const assetResult = await applyPlaybackToAsset(admin, assetId, playback, slug)
      if (!assetResult.ok) return res.status(400).json({ error: assetResult.error })
    } else {
      const { data: existing } = await admin
        .from('video_assets')
        .select('id')
        .eq('cloudflare_uid', cloudflareUid)
        .maybeSingle()
      if (existing?.id) {
        assetId = existing.id
        const assetResult = await applyPlaybackToAsset(admin, assetId, playback, slug)
        if (!assetResult.ok) return res.status(400).json({ error: assetResult.error })
      }
    }

    const catalogResult = await applyPlaybackToCatalog(admin, slug, playback)
    if (!catalogResult.ok) {
      return res.status(400).json({ error: catalogResult.error })
    }

    await linkLessonVideo(admin, slug, playback.uid)

    return res.json({
      course: catalogResult.course,
      assetId,
      catalogSlug: slug,
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
        await linkLessonVideo(admin, asset.catalog_slug, playback.uid)
      }
    }

    const { data: courses } = await admin.from('courses_catalog').select('slug').eq('cloudflare_uid', uid)
    for (const course of courses || []) {
      await applyPlaybackToCatalog(admin, course.slug, playback)
    }

    return res.json({ ok: true, uid, ready: playback.ready })
  })
}
