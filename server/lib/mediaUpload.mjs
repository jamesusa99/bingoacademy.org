import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 3 * 1024 * 1024

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCAL_UPLOAD_ROOT = path.join(__dirname, '../../public/uploads/modules')

function extForType(contentType) {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'bin'
  }
}

async function uploadToLocalPublic(buffer, contentType, folder) {
  const dir = path.join(LOCAL_UPLOAD_ROOT, folder)
  await fs.mkdir(dir, { recursive: true })
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extForType(contentType)}`
  const filepath = path.join(dir, filename)
  await fs.writeFile(filepath, buffer)
  return `/uploads/modules/${folder}/${filename}`
}

async function uploadToSupabase(admin, buffer, contentType, folder) {
  const objectPath = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}.${extForType(contentType)}`
  const { error } = await admin.storage.from('media').upload(objectPath, buffer, {
    contentType,
    upsert: false,
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)

  const { data } = admin.storage.from('media').getPublicUrl(objectPath)
  return data?.publicUrl || null
}

export async function uploadAdminImage(admin, { buffer, contentType, folder = 'modules' }) {
  if (!buffer?.length) return { error: 'Empty file' }
  if (!ALLOWED_TYPES.has(contentType)) {
    return { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
  }
  if (buffer.length > MAX_BYTES) {
    return { error: 'Image must be 3 MB or smaller' }
  }

  if (admin) {
    try {
      const url = await uploadToSupabase(admin, buffer, contentType, folder)
      if (url) return { url }
    } catch (err) {
      console.warn('[mediaUpload] Supabase storage failed, using local public folder:', err.message)
    }
  }

  try {
    const url = await uploadToLocalPublic(buffer, contentType, folder)
    return { url }
  } catch (err) {
    return { error: err.message || 'Failed to save image' }
  }
}

export function parseDataUrlImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return { error: 'Missing image data' }
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/i)
  if (!match) return { error: 'Invalid image data URL' }
  const contentType = match[1].toLowerCase()
  const buffer = Buffer.from(match[2], 'base64')
  return { buffer, contentType }
}
