function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

function centerCropRect(srcW, srcH, aspectRatio) {
  const srcAspect = srcW / srcH
  if (srcAspect > aspectRatio) {
    const cropH = srcH
    const cropW = srcH * aspectRatio
    return { sx: (srcW - cropW) / 2, sy: 0, sw: cropW, sh: cropH }
  }
  const cropW = srcW
  const cropH = srcW / aspectRatio
  return { sx: 0, sy: (srcH - cropH) / 2, sw: cropW, sh: cropH }
}

function fitOutputSize(cropW, cropH, aspectRatio, maxWidth, maxHeight) {
  let outW = cropW
  let outH = cropH
  if (outW > maxWidth) {
    outW = maxWidth
    outH = Math.round(maxWidth / aspectRatio)
  }
  if (outH > maxHeight) {
    outH = maxHeight
    outW = Math.round(maxHeight * aspectRatio)
  }
  return { outW, outH }
}

async function canvasToBlob(canvas, type, quality) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality))
  if (blob) return blob
  if (type === 'image/webp') {
    return canvasToBlob(canvas, 'image/jpeg', quality)
  }
  throw new Error('Failed to encode image')
}

/**
 * Center-crop to preset aspect ratio, scale down, and re-encode for upload.
 * GIF files are returned unchanged (animation preserved).
 */
export async function resizeImageFileForPreset(file, preset, { quality = 0.88 } = {}) {
  if (!file || !preset) return file
  if (file.type === 'image/gif') return file

  const { aspectRatio, maxWidth, maxHeight } = preset
  const img = await loadImageFromFile(file)
  const crop = centerCropRect(img.naturalWidth, img.naturalHeight, aspectRatio)
  const { outW, outH } = fitOutputSize(crop.sw, crop.sh, aspectRatio, maxWidth, maxHeight)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to process image')
  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, outW, outH)

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp'
  const blob = await canvasToBlob(canvas, outputType, quality)
  const ext = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg'
  const baseName = (file.name || 'cover').replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}-${preset.id}.${ext}`, { type: blob.type || outputType })
}
