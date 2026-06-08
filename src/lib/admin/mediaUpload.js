import { adminFetch } from './api'

const MAX_BYTES = 3 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export async function uploadAdminImageFile(file, { folder = 'modules' } = {}) {
  if (!file) throw new Error('No file selected')
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 3 MB or smaller')
  }

  const dataUrl = await readFileAsDataUrl(file)
  const { url } = await adminFetch('/api/admin/media/upload-image', {
    method: 'POST',
    body: JSON.stringify({ dataUrl, folder }),
  })
  if (!url) throw new Error('Upload failed')
  return url
}
