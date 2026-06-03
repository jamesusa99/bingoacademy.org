import { useAdminLocale } from '../../contexts/AdminLocaleContext'

export default function AdminPageHeader({ title, description, titleKey, descriptionKey, actions }) {
  const { t } = useAdminLocale()
  const resolvedTitle = titleKey ? t(titleKey) : title
  const resolvedDesc = descriptionKey ? t(descriptionKey) : description

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-bingo-dark">{resolvedTitle}</h1>
        {resolvedDesc ? <p className="text-sm text-slate-500 mt-1 max-w-2xl">{resolvedDesc}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
    </div>
  )
}
