import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Upload, User } from 'lucide-react'
import { uploadAdminImageFile } from '../../lib/admin/mediaUpload'
import AdminField from './AdminField'

export default function AdminImageUpload({
  value,
  onChange,
  labels,
  disabled = false,
  folder = 'uploads',
  aspectClass = 'aspect-square',
  maxWidthClass = 'max-w-xs',
}) {
  const inputRef = useRef(null)
  const localPreviewRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null)

  const hasCustom = Boolean(value?.trim())
  const previewUrl = localPreviewUrl || (hasCustom ? value.trim() : null)

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current)
        localPreviewRef.current = null
      }
    }
  }, [])

  const clearLocalPreview = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current)
      localPreviewRef.current = null
    }
    setLocalPreviewUrl(null)
  }

  const pickFile = () => {
    if (disabled || uploading) return
    inputRef.current?.click()
  }

  const uploadFile = async (file) => {
    if (!file || disabled || uploading) return

    clearLocalPreview()
    setError(null)

    try {
      const url = URL.createObjectURL(file)
      localPreviewRef.current = url
      setLocalPreviewUrl(url)
    } catch {
      /* local preview optional */
    }

    setUploading(true)
    try {
      const url = await uploadAdminImageFile(file, { folder })
      onChange(url)
      clearLocalPreview()
    } catch (err) {
      clearLocalPreview()
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    uploadFile(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    if (disabled || uploading) return
    setDragOver(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    if (disabled || uploading) return
    const file = event.dataTransfer.files?.[0]
    uploadFile(file)
  }

  const clearImage = () => {
    if (disabled || uploading) return
    onChange('')
    clearLocalPreview()
    setError(null)
  }

  const dropzoneLabel = dragOver
    ? labels.dropzoneActive
    : hasCustom || localPreviewUrl
      ? labels.replace
      : labels.dropzone

  return (
    <AdminField label={labels.label}>
      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-3">
        <div
          role="button"
          tabIndex={disabled || uploading ? -1 : 0}
          onClick={pickFile}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              pickFile()
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-disabled={disabled || uploading}
          className={[
            'group relative w-full rounded-xl overflow-hidden border-2 border-dashed transition-colors',
            maxWidthClass,
            aspectClass,
            disabled || uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
            dragOver
              ? 'border-primary bg-primary/5'
              : hasCustom || localPreviewUrl
                ? 'border-slate-300 bg-slate-100 hover:border-primary/50'
                : 'border-slate-300 bg-white hover:border-primary/40 hover:bg-primary/5',
          ].join(' ')}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
              <User className="w-12 h-12" />
            </div>
          )}

          <div
            className={[
              'absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center transition-opacity',
              hasCustom || localPreviewUrl
                ? 'bg-black/45 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                : 'bg-slate-900/5',
              dragOver ? 'opacity-100 bg-primary/20' : '',
            ].join(' ')}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-semibold text-slate-700">{labels.uploading}</p>
              </>
            ) : (
              <>
                <div
                  className={[
                    'rounded-full p-2.5',
                    hasCustom || localPreviewUrl ? 'bg-white/90 text-primary' : 'bg-white text-primary shadow-sm',
                  ].join(' ')}
                >
                  {hasCustom || localPreviewUrl ? (
                    <ImagePlus className="w-6 h-6" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <p
                  className={[
                    'text-xs font-semibold leading-snug',
                    hasCustom || localPreviewUrl ? 'text-white' : 'text-slate-700',
                  ].join(' ')}
                >
                  {dropzoneLabel}
                </p>
                {!hasCustom && !localPreviewUrl ? (
                  <p className="text-[10px] text-slate-500">{labels.formats}</p>
                ) : null}
              </>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={pickFile}
            disabled={disabled || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? labels.uploading : hasCustom ? labels.replaceBtn : labels.upload}
          </button>
          {hasCustom ? (
            <button
              type="button"
              onClick={clearImage}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {labels.remove}
            </button>
          ) : null}
        </div>

        <details className="group/details">
          <summary className="text-[10px] font-medium text-slate-500 cursor-pointer hover:text-slate-700 list-none [&::-webkit-details-marker]:hidden">
            {labels.advanced}
          </summary>
          <div className="mt-2">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={labels.urlPlaceholder}
              disabled={disabled || uploading}
            />
          </div>
        </details>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <p className="text-[10px] text-slate-400 leading-relaxed">{labels.hint}</p>
      </div>
    </AdminField>
  )
}
