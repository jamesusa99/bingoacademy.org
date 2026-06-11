import { useRef, useState } from 'react'
import { LAB_RUNTIME_TYPES } from '../../config/labExperimentRuntime'
import { uploadAdminLabAsset } from '../../lib/admin/mediaUpload'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

/**
 * L3 experiment runtime config — iframe, HTML, programming, packages, etc.
 * @param {{ value: object, onChange: (next: object) => void, labels: object, packSlug?: string, experimentSlug?: string, disabled?: boolean }} props
 */
export default function AdminLabExperimentRuntimeEditor({
  value,
  onChange,
  labels,
  packSlug = '',
  experimentSlug = '',
  disabled = false,
}) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const set = (key, val) => onChange({ ...value, [key]: val })

  const onPickFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const folder = `lab-experiments/${packSlug || 'pack'}/${experimentSlug || 'exp'}`
      const url = await uploadAdminLabAsset(file, { folder })
      set('url', url)
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const type = value?.type || 'steps_only'

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-bingo-dark">{labels.runtimeTitle}</h4>
        <p className="text-xs text-slate-500 mt-1">{labels.runtimeDesc}</p>
      </div>

      <label className="block text-xs text-slate-600">
        {labels.runtimeTypeLabel}
        <select
          className={`${inputClass} mt-1`}
          value={type}
          disabled={disabled}
          onChange={(e) => set('type', e.target.value)}
        >
          {LAB_RUNTIME_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.labelZh} / {t.label}
            </option>
          ))}
        </select>
      </label>

      {type === 'external_link' || type === 'iframe' || type === 'html_page' ? (
        <>
          <label className="block text-xs text-slate-600">
            {labels.runtimeUrlLabel}
            <input
              className={`${inputClass} mt-1`}
              placeholder={labels.runtimeUrlPh}
              value={value.url || ''}
              disabled={disabled}
              onChange={(e) => set('url', e.target.value)}
            />
          </label>
          {(type === 'html_page' || type === 'install_package') && !disabled ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-3 bg-slate-50/80">
              <p className="text-xs text-slate-600 mb-2">{labels.runtimeUploadHint}</p>
              <input ref={fileRef} type="file" accept=".html,.htm,.zip,.pdf" className="hidden" onChange={onPickFile} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {uploading ? labels.uploading : labels.uploadAsset}
              </button>
              {uploadError ? <p className="text-xs text-red-600 mt-1">{uploadError}</p> : null}
            </div>
          ) : null}
        </>
      ) : null}

      {type === 'programming' ? (
        <label className="block text-xs text-slate-600">
          {labels.programmingLabPh}
          <input
            className={`${inputClass} mt-1`}
            placeholder="lab-1"
            value={value.labId || ''}
            disabled={disabled}
            onChange={(e) => set('labId', e.target.value)}
          />
        </label>
      ) : null}

      {type === 'interactive' ? (
        <>
          <label className="block text-xs text-slate-600">
            {labels.runtimeInternalPathLabel}
            <input
              className={`${inputClass} mt-1 font-mono text-xs`}
              placeholder="/exploration/cyber-tennis"
              value={value.internalPath || ''}
              disabled={disabled}
              onChange={(e) => set('internalPath', e.target.value)}
            />
          </label>
          <label className="block text-xs text-slate-600">
            {labels.runtimeUrlOptional}
            <input
              className={`${inputClass} mt-1`}
              placeholder="https://…"
              value={value.url || ''}
              disabled={disabled}
              onChange={(e) => set('url', e.target.value)}
            />
          </label>
        </>
      ) : null}

      {type === 'install_package' ? (
        <>
          <label className="block text-xs text-slate-600">
            {labels.downloadUrlPh}
            <input
              className={`${inputClass} mt-1`}
              value={value.url || ''}
              disabled={disabled}
              onChange={(e) => set('url', e.target.value)}
            />
          </label>
          <label className="block text-xs text-slate-600">
            {labels.downloadLabelPh}
            <input
              className={`${inputClass} mt-1`}
              value={value.downloadLabel || ''}
              disabled={disabled}
              onChange={(e) => set('downloadLabel', e.target.value)}
            />
          </label>
          {!disabled ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-3 bg-slate-50/80">
              <input ref={fileRef} type="file" accept=".zip,.pdf,.html,.htm" className="hidden" onChange={onPickFile} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {uploading ? labels.uploading : labels.uploadPackage}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {type !== 'steps_only' && type !== 'external_link' && type !== 'install_package' ? (
        <label className="block text-xs text-slate-600">
          {labels.embedHeightLabel}
          <input
            type="number"
            min={280}
            max={900}
            className={`${inputClass} mt-1`}
            value={value.embedHeight || 520}
            disabled={disabled}
            onChange={(e) => set('embedHeight', parseInt(e.target.value, 10) || 520)}
          />
        </label>
      ) : null}

      {type === 'external_link' ? (
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={Boolean(value.openInNewTab)}
            disabled={disabled}
            onChange={(e) => set('openInNewTab', e.target.checked)}
          />
          {labels.openInNewTab}
        </label>
      ) : null}

      {type === 'steps_only' ? (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          {labels.runtimeStepsOnlyHint}
        </p>
      ) : null}
    </div>
  )
}
