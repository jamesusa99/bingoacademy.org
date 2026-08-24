import { useAdminLocale } from '../../contexts/AdminLocaleContext'

export default function AdminLanguageSwitcher({ className = '', englishFirst = false, tone = 'dark' }) {
  const { locale, setLocale, t } = useAdminLocale()

  const buttons = englishFirst
    ? [
        { id: 'en', label: 'EN' },
        { id: 'zh', label: t('lang.zh') },
      ]
    : [
        { id: 'zh', label: t('lang.zh') },
        { id: 'en', label: 'EN' },
      ]

  const inactive =
    tone === 'light'
      ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
      : 'text-slate-400 hover:text-white hover:bg-white/10'

  return (
    <div className={`flex items-center gap-1 ${className}`} role="group" aria-label={t('lang.switch')}>
      {buttons.map((btn) => (
        <button
          key={btn.id}
          type="button"
          onClick={() => setLocale(btn.id)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition ${
            locale === btn.id ? 'bg-cyan-500 text-white' : inactive
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
