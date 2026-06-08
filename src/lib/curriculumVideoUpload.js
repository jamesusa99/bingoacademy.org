import {
  createStreamUploadUrl,
  fetchStreamUploadLimits,
  syncStreamVideo,
  assignStreamToCourse,
} from './admin/api'
import { adminInsert, adminUpdate } from './admin/db'
import { formatBytes, uploadFileToStream } from './streamUpload'
import { formatDuration, readVideoFileMeta } from './videoFileMeta'
import { resolveCurriculumLabels } from './videoCurriculum'

const DEFAULT_LIMITS = {
  maxFileBytes: 30 * 1024 * 1024 * 1024,
  recommendedMaxFileBytes: 4 * 1024 * 1024 * 1024,
  maxDurationSeconds: 36_000,
}

export { formatBytes, DEFAULT_LIMITS as CURRICULUM_VIDEO_LIMITS }

/**
 * Upload a local video file to Cloudflare Stream and register video_assets.
 * Returns the Cloudflare UID to store on the lesson.
 */
export async function uploadCurriculumVideo({
  file,
  productLine,
  levels,
  path,
  lessonTitle,
  catalogSlug,
  onProgress,
}) {
  if (!file) throw new Error('No file selected')

  const limits = await fetchStreamUploadLimits().catch(() => DEFAULT_LIMITS)
  const maxDurationSeconds = limits.maxDurationSeconds || DEFAULT_LIMITS.maxDurationSeconds

  let fileMeta = null
  try {
    fileMeta = await readVideoFileMeta(file)
  } catch {
    /* optional — still attempt upload if browser cannot read metadata */
  }

  if (fileMeta?.durationSeconds && fileMeta.durationSeconds > maxDurationSeconds) {
    throw new Error(
      `Video is ${formatDuration(fileMeta.durationSeconds)} — maximum allowed is ${formatDuration(maxDurationSeconds)}.`
    )
  }

  if (file.size > limits.maxFileBytes) {
    throw new Error(
      `File is ${formatBytes(file.size)} — maximum is ${formatBytes(limits.maxFileBytes)}.`
    )
  }

  if (file.size > limits.recommendedMaxFileBytes) {
    const ok = window.confirm(
      `File is ${formatBytes(file.size)}. Browser uploads work best under ${formatBytes(
        limits.recommendedMaxFileBytes
      )}. Continue anyway?`
    )
    if (!ok) throw new Error('Upload cancelled')
  }

  const title = lessonTitle?.trim() || file.name.replace(/\.[^.]+$/, '') || file.name
  const curriculumMeta = resolveCurriculumLabels(levels, path)
  const slug = catalogSlug?.trim() || null

  const { uploadURL, uid } = await createStreamUploadUrl({
    title,
    maxDurationSeconds,
  })

  let rowId = null
  try {
    const row = await adminInsert('video_assets', {
      title,
      cloudflare_uid: uid,
      catalog_slug: slug,
      product_line: productLine,
      ...curriculumMeta,
      status: 'processing',
    })
    rowId = row.id

    await uploadFileToStream(uploadURL, file, { onProgress })

    await syncStreamVideo({
      videoAssetId: row.id,
      wait: true,
      catalogSlug: slug || undefined,
    })

    if (slug) {
      await assignStreamToCourse({ catalogSlug: slug, uid })
    }

    return uid
  } catch (err) {
    if (rowId) {
      try {
        await adminUpdate('video_assets', rowId, { status: 'error' })
      } catch {
        /* ignore cleanup failure */
      }
    }
    throw err
  }
}
