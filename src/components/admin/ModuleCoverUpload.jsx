import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { uploadAdminImageFile } from '../../lib/admin/mediaUpload'
import { DEFAULT_MODULE_COVER, resolveModuleCoverUrl } from '../../config/moduleCover'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function ModuleCoverUpload({
  value,
  onChange,
  labels,
  disabled = false,
  folder = 'modules',
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const previewUrl = resolveModuleCoverUrl(value)
  const hasCustom = Boolean(value?.trim())

  const pickFile = () => {
    if (disabled || uploading) return
    inputRef.current?.click()
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const url = await uploadAdminImageFile(file, { folder })
      onChange(url)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const clearCover = () => {
    if (disabled || uploading) return
    onChange('')
    setError(null)
  }

  return (
    <Field label={labels.moduleCover}>
      <div className="space-y-3">
        <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          {!hasCustom ? (
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-black/55 text-white px-2 py-0.5 rounded">
              {labels.moduleCoverDefaultBadge}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={pickFile}
            disabled={disabled || uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploading ? labels.moduleCoverUploading : labels.moduleCoverUpload}
          </button>
          {hasCustom ? (
            <button
              type="button"
              onClick={clearCover}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              {labels.moduleCoverRemove}
            </button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />

        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">
            {labels.moduleCoverUrlOptional}
          </label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={labels.phModuleCover}
            disabled={disabled || uploading}
          />
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <p className="text-[10px] text-slate-400">{labels.moduleCoverHint}</p>
        {!hasCustom ? (
          <p className="text-[10px] text-slate-500">
            {labels.moduleCoverDefaultHint} ({DEFAULT_MODULE_COVER})
          </p>
        ) : null}
      </div>
    </Field>
  )
}
