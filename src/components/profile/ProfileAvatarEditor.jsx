import { useRef, useState } from 'react'
import { profileInitials } from '../../lib/userProfile'
import { removeProfileAvatar, saveProfileAvatar } from '../../lib/profileAvatar'

export default function ProfileAvatarEditor({
  userId,
  profile,
  user,
  onSaved,
  size = 'md',
  showActions = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const avatarUrl = previewUrl || profile?.avatar_url?.trim() || ''
  const dim = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-16 h-16 text-xl'

  const pickFile = () => {
    if (uploading) return
    inputRef.current?.click()
  }

  const applyFile = async (file) => {
    if (!file || uploading) return
    setError('')
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setUploading(true)
    try {
      const next = await saveProfileAvatar(userId, file)
      onSaved?.(next)
      URL.revokeObjectURL(localUrl)
      setPreviewUrl('')
    } catch (err) {
      URL.revokeObjectURL(localUrl)
      setPreviewUrl('')
      setError(err.message || 'Could not upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    applyFile(file)
  }

  const handleRemove = async () => {
    if (uploading) return
    setError('')
    setUploading(true)
    try {
      const next = await removeProfileAvatar(userId)
      setPreviewUrl('')
      onSaved?.(next)
    } catch (err) {
      setError(err.message || 'Could not remove photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={showActions ? 'space-y-2' : ''}>
      <div className={`flex items-center gap-3 ${showActions ? '' : 'shrink-0'}`}>
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          aria-label="Change profile photo"
          className={`group relative ${dim} rounded-full shrink-0 cursor-pointer disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
        >
          <span className={`relative ${dim} rounded-full overflow-hidden block`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {profileInitials(profile, user)}
              </span>
            )}
            <span className="absolute inset-0 rounded-full bg-black/45 text-white text-[10px] font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
              {uploading ? 'Uploading…' : 'Change'}
            </span>
          </span>
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-white text-xs leading-6 text-center shadow pointer-events-none">
            {uploading ? '…' : '✎'}
          </span>
        </button>

        {showActions ? (
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={pickFile}
                disabled={uploading}
                className="rounded-lg bg-primary text-white px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : avatarUrl ? 'Replace photo' : 'Upload photo'}
              </button>
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="rounded-lg border border-slate-300 text-slate-600 px-3 py-1.5 text-xs disabled:opacity-60"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-500">JPEG, PNG, or WebP. Square crop is applied automatically.</p>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
      {error ? <p className="text-xs text-red-600 mt-1 max-w-xs">{error}</p> : null}
    </div>
  )
}
