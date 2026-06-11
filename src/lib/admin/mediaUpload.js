import { adminFetch } from './api'
import { supabase, isSupabaseConfigured } from '../supabase'

const MAX_BYTES = 3 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function extForType(type) {
  switch (type) {
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

function randomSuffix() {
  return Math.random().toString(36).slice(2, 10)
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function storageErrorHint(message) {
  const text = message || ''
  if (text.includes('Bucket not found') || text.includes('bucket')) {
    return 'Storage bucket "media" is missing. Run Supabase migrations 022 and 023, then try again.'
  }
  if (text.includes('row-level security') || text.includes('policy')) {
    return 'Storage permission denied. Confirm your account has admin/editor role and migration 023 is applied.'
  }
  return text || 'Upload failed'
}

function extForFile(file) {
  const name = file?.name || ''
  const dot = name.lastIndexOf('.')
  if (dot >= 0) return name.slice(dot + 1).toLowerCase()
  return extForType(file.type)
}

const LAB_ASSET_TYPES = new Set([
  'text/html',
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
  'application/octet-stream',
])
const LAB_MAX_BYTES = 15 * 1024 * 1024

async function uploadAdminFileViaStorage(file, folder) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Please sign in again to upload files')
  }

  const safeFolder = String(folder).replace(/[^a-z0-9-/_]/gi, '') || 'lab-assets'
  const objectPath = `${safeFolder}/${Date.now()}-${randomSuffix()}.${extForFile(file)}`
  const { error } = await supabase.storage.from('media').upload(objectPath, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
    cacheControl: '3600',
  })

  if (error) {
    throw new Error(storageErrorHint(error.message))
  }

  const { data } = supabase.storage.from('media').getPublicUrl(objectPath)
  if (!data?.publicUrl) throw new Error('Upload failed')
  return data.publicUrl
}

async function uploadAdminImageViaStorage(file, folder) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Please sign in again to upload images')
  }

  const objectPath = `${folder}/${Date.now()}-${randomSuffix()}.${extForType(file.type)}`
  const { error } = await supabase.storage.from('media').upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: '3600',
  })

  if (error) {
    throw new Error(storageErrorHint(error.message))
  }

  const { data } = supabase.storage.from('media').getPublicUrl(objectPath)
  if (!data?.publicUrl) throw new Error('Upload failed')
  return data.publicUrl
}

async function uploadAdminImageViaApi(file, folder) {
  const dataUrl = await readFileAsDataUrl(file)
  const { url } = await adminFetch('/api/admin/media/upload-image', {
    method: 'POST',
    body: JSON.stringify({ dataUrl, folder }),
  })
  if (!url) throw new Error('Upload failed')
  return url
}

export async function uploadAdminImageFile(file, { folder = 'modules' } = {}) {
  if (!file) throw new Error('No file selected')
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 3 MB or smaller')
  }

  const safeFolder = String(folder).replace(/[^a-z0-9-_]/gi, '') || 'modules'

  try {
    return await uploadAdminImageViaStorage(file, safeFolder)
  } catch (storageErr) {
    try {
      return await uploadAdminImageViaApi(file, safeFolder)
    } catch (apiErr) {
      const apiMsg = apiErr?.message || ''
      if (apiErr?.status === 404 || apiErr?.status === 405) {
        throw new Error(storageErr.message || storageErrorHint(apiMsg))
      }
      throw new Error(apiMsg || storageErr.message || 'Upload failed')
    }
  }
}

export async function uploadAdminLabAsset(file, { folder = 'lab-assets' } = {}) {
  if (!file) throw new Error('No file selected')
  const ext = extForFile(file)
  const allowedExt = new Set(['html', 'htm', 'zip', 'pdf'])
  if (!LAB_ASSET_TYPES.has(file.type) && !allowedExt.has(ext)) {
    throw new Error('Allowed: HTML, ZIP, or PDF')
  }
  if (file.size > LAB_MAX_BYTES) {
    throw new Error('File must be 15 MB or smaller')
  }
  return uploadAdminFileViaStorage(file, folder)
}
