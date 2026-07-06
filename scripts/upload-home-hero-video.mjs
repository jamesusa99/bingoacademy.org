/**
 * Upload a local MP4 to Cloudflare Stream and set platform_settings.home_hero_video.
 *
 * Usage:
 *   node scripts/upload-home-hero-video.mjs "/path/to/hero.mp4"
 */
import fs from 'node:fs'
import path from 'node:path'
import '../server/lib/loadEnv.mjs'
import { getSupabaseAdmin } from '../server/lib/supabaseAdmin.mjs'
import {
  isStreamConfigured,
  syncStreamPlayback,
  buildStreamThumbnailUrl,
} from '../server/lib/cloudflareStream.mjs'
import { HOME_HERO_VIDEO_KEY } from '../src/config/homeHero.js'

const fileArg = process.argv[2]
if (!fileArg) {
  console.error('Usage: node scripts/upload-home-hero-video.mjs "/path/to/video.mp4"')
  process.exit(1)
}

const filePath = path.resolve(fileArg)
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath)
  process.exit(1)
}

const stat = fs.statSync(filePath)
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const apiToken = process.env.CLOUDFLARE_API_TOKEN

async function main() {
  if (!isStreamConfigured()) {
    throw new Error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local')
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    throw new Error('Set SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  console.log('[hero-video] file:', filePath)
  console.log('[hero-video] size:', `${(stat.size / (1024 * 1024)).toFixed(1)} MB`)

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds: 120,
        requireSignedURLs: false,
        meta: { name: 'Homepage Hero Video' },
      }),
    }
  )

  const cfJson = await cfRes.json()
  if (!cfRes.ok || !cfJson.success) {
    throw new Error(cfJson.errors?.[0]?.message || `Cloudflare direct_upload failed (${cfRes.status})`)
  }

  const { uploadURL, uid } = cfJson.result
  console.log('[hero-video] Cloudflare uid:', uid)
  console.log('[hero-video] uploading…')

  const blob = new Blob([fs.readFileSync(filePath)], { type: 'video/mp4' })
  const form = new FormData()
  form.append('file', blob, path.basename(filePath))

  const uploadRes = await fetch(uploadURL, { method: 'POST', body: form })
  if (!uploadRes.ok) {
    const text = await uploadRes.text()
    throw new Error(`Cloudflare upload failed (${uploadRes.status}): ${text.slice(0, 300)}`)
  }

  console.log('[hero-video] waiting for encoding…')
  const sync = await syncStreamPlayback(uid, { maxAttempts: 40, delayMs: 3000 })
  if (!sync.ok) {
    throw new Error(sync.error || 'Failed to sync playback')
  }

  const { hlsUrl, thumbnailUrl } = sync.playback
  if (!hlsUrl) {
    throw new Error('No HLS URL after encoding — check CLOUDFLARE_STREAM_CUSTOMER_CODE')
  }

  const posterUrl = thumbnailUrl || buildStreamThumbnailUrl(uid) || ''
  const payload = { videoUrl: hlsUrl, posterUrl }

  const { error } = await admin
    .from('platform_settings')
    .upsert({ key: HOME_HERO_VIDEO_KEY, value: payload, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) throw new Error(error.message)

  console.log('[hero-video] saved platform_settings.home_hero_video')
  console.log('  videoUrl:', payload.videoUrl)
  console.log('  posterUrl:', payload.posterUrl)
  if (sync.pending) {
    console.log('[hero-video] note: video may still be processing — refresh homepage in ~1 min')
  }
}

main().catch((err) => {
  console.error('[hero-video] failed:', err.message)
  process.exit(1)
})
