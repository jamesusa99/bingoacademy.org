import { useRef, useState } from 'react'
import { Upload, X, Video } from 'lucide-react'
import { uploadCurriculumVideo } from '../../lib/curriculumVideoUpload'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function CurriculumVideoUpload({
  productLine,
  levels,
  path,
  lessonTitle,
  catalogSlug,
  cloudflareUid,
  onUidChange,
  labels,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const pickAndUpload = () => {
    if (disabled || uploading) return
    setError(null)
    setInfo(null)
    inputRef.current?.click()
  }

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError(null)
    setInfo(null)
    try {
      const uid = await uploadCurriculumVideo({
        file,
        productLine,
        levels,
        path,
        lessonTitle,
        catalogSlug,
        onProgress: setProgress,
      })
      onUidChange?.(uid)
      setInfo(labels.videoUploadReady)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clearUid = () => {
    onUidChange?.('')
    setInfo(null)
    setError(null)
  }

  return (
    <Field label={labels.uploadVideo}>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-3">
        {cloudflareUid ? (
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Video className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-700">{labels.videoAttached}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate max-w-md">{cloudflareUid}</p>
              </div>
            </div>
            {!uploading ? (
              <button
                type="button"
                onClick={clearUid}
                className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-600"
              >
                <X className="w-3 h-3" />
                {labels.removeVideo}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-slate-500">{labels.noVideoAttached}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={pickAndUpload}
            disabled={disabled || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-60"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading
              ? progress != null
                ? labels.uploadingVideoPct?.replace('{{pct}}', String(progress)) ||
                  `Uploading ${progress}%…`
                : labels.videoUploadWorking
              : cloudflareUid
                ? labels.replaceVideo
                : labels.chooseVideoFile}
          </button>
        </div>

        {uploading && progress != null ? (
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        <p className="text-[10px] text-slate-400 leading-relaxed">{labels.videoUploadHint}</p>

        {info ? <p className="text-xs text-emerald-700">{info}</p> : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </Field>
  )
}
