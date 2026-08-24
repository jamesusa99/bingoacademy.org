import { authFetch } from './checkout'
import { supabase, isSupabaseConfigured } from './supabase'
import { resizeImageFileForPreset } from './admin/imageResize'
import { updateMyProfile } from './userProfile'

export const AVATAR_PRESET = {
  id: 'avatar',
  aspectRatio: 1,
  maxWidth: 512,
  maxHeight: 512,
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/pjpeg'])
const MAX_BYTES = 8 * 1024 * 1024

function extForType(type) {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 10)
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read photo'))
    reader.readAsDataURL(file)
  })
}

export function validateAvatarFile(file) {
  if (!file) throw new Error('No photo selected')
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  const looksLikeImage =
    ALLOWED_TYPES.has(type) ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp')
  if (!looksLikeImage) {
    throw new Error('Please choose a JPEG, PNG, or WebP photo')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Photo must be 8 MB or smaller')
  }
}

async function uploadAvatarViaStorage(userId, file) {
  if (!isSupabaseConfigured) throw new Error('Sign-in is not configured')
  const objectPath = `avatars/${userId}/${Date.now()}-${randomSuffix()}.${extForType(file.type)}`
  const { error } = await supabase.storage.from('media').upload(objectPath, file, {
    contentType: file.type || 'image/webp',
    upsert: false,
    cacheControl: '3600',
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('media').getPublicUrl(objectPath)
  if (!data?.publicUrl) throw new Error('Upload failed')
  return data.publicUrl
}

export async function saveProfileAvatar(userId, file) {
  if (!userId) throw new Error('Sign in required')
  validateAvatarFile(file)
  const prepared = await resizeImageFileForPreset(file, AVATAR_PRESET)

  try {
    const url = await uploadAvatarViaStorage(userId, prepared)
    const { data, error } = await updateMyProfile(userId, { avatar_url: url })
    if (error) throw error
    return data
  } catch (storageErr) {
    try {
      const dataUrl = await fileToDataUrl(prepared)
      const body = await authFetch('/api/me/avatar', {
        method: 'POST',
        body: JSON.stringify({ dataUrl }),
      })
      if (body.profile) return body.profile
      const { data, error } = await updateMyProfile(userId, { avatar_url: body.url })
      if (error) throw error
      return data
    } catch (apiErr) {
      const dataUrl = await fileToDataUrl(prepared)
      const { data, error } = await updateMyProfile(userId, { avatar_url: dataUrl })
      if (error) {
        throw new Error(apiErr.message || storageErr.message || error.message || 'Could not save photo')
      }
      return data
    }
  }
}

export async function removeProfileAvatar(userId) {
  if (!userId) throw new Error('Sign in required')
  try {
    const body = await authFetch('/api/me/avatar', { method: 'DELETE' })
    if (body.profile) return body.profile
  } catch {
    /* fall through to direct profile update */
  }
  const { data, error } = await updateMyProfile(userId, { avatar_url: '' })
  if (error) throw error
  return data
}
