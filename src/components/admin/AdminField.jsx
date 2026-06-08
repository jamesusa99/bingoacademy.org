import { useAdminLocale } from '../../contexts/AdminLocaleContext'

export function AdminFieldBadge({ required }) {
  const { t } = useAdminLocale()

  if (required) {
    return (
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none bg-red-50 text-red-600 border border-red-100">
        {t('crud.fieldRequired')}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none bg-slate-100 text-slate-500">
      {t('crud.fieldOptional')}
    </span>
  )
}

/**
 * Admin form field with 必填 / 选填 badge.
 * @param {boolean} [required=false]
 * @param {boolean} [showBadge=true] — set false for read-only context labels
 */
export default function AdminField({
  label,
  required = false,
  showBadge = true,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5 mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {showBadge ? <AdminFieldBadge required={required} /> : null}
      </div>
      {children}
    </div>
  )
}
