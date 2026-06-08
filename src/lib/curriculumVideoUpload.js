import {
  createStreamUploadUrl,
  fetchStreamUploadLimits,
  syncStreamVideo,
} from './admin/api'
import { adminInsert, adminUpdate } from './admin/db'
import {
  formatBytes,
  STREAM_BASIC_UPLOAD_MAX_BYTES,
  STREAM_TUS_RECOMMENDED_MIN_BYTES,
  uploadVideoToCloudflare,
} from './streamUpload'
import { formatDuration, readVideoFileMeta } from './videoFileMeta'
import { resolveCurriculumLabels } from './videoCurriculum'

const DEFAULT_LIMITS = {
  maxFileBytes: 30 * 1024 * 1024 * 1024,
  recommendedMaxFileBytes: 4 * 1024 * 1024 * 1024,
  basicMaxFileBytes: STREAM_BASIC_UPLOAD_MAX_BYTES,
  tusMinFileBytes: STREAM_TUS_RECOMMENDED_MIN_BYTES,
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
  const basicMaxBytes = limits.basicMaxFileBytes || STREAM_BASIC_UPLOAD_MAX_BYTES
  const tusMinBytes = limits.tusMinFileBytes || STREAM_TUS_RECOMMENDED_MIN_BYTES

  let fileMeta = null
  try {
    fileMeta = await readVideoFileMeta(file, { timeoutMs: 8000 })
  } catch {
    /* optional */
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

  if (file.size > limits.recommendedMaxFileBytes && file.size <= basicMaxBytes) {
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

  const useTus = file.size > basicMaxBytes || file.size >= tusMinBytes
  let uploadURL = null
  let basicUid = null

  if (!useTus) {
    const created = await createStreamUploadUrl({ title, maxDurationSeconds })
    uploadURL = created.uploadURL
    basicUid = created.uid
  }

  let rowId = null
  try {
    const registerAsset = async (uid) => {
      if (rowId) return
      const row = await adminInsert('video_assets', {
        title,
        cloudflare_uid: uid,
        catalog_slug: slug,
        product_line: productLine,
        ...curriculumMeta,
        status: 'processing',
      })
      rowId = row.id
    }

    const { uid } = await uploadVideoToCloudflare({
      file,
      uploadURL,
      uid: basicUid,
      maxDurationSeconds,
      onProgress,
      basicMaxBytes,
      tusMinBytes,
    })

    await registerAsset(uid)

    syncStreamVideo({
      videoAssetId: rowId,
      wait: false,
    }).catch(() => {
      /* encoding continues on Cloudflare — save lesson to finish linking */
    })

    return uid
  } catch (err) {
    if (rowId) {
      try {
        await adminUpdate('video_assets', rowId, { status: 'error' })
      } catch {
        /* ignore */
      }
    }
    throw err
  }
}
