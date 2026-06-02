import { useAdminLocale } from '../../contexts/AdminLocaleContext'

export default function AdminLanguageSwitcher({ className = '' }) {
  const { locale, setLocale, t } = useAdminLocale()

  return (
    <div className={`flex items-center gap-1 ${className}`} role="group" aria-label={t('lang.switch')}>
      <button
        type="button"
        onClick={() => setLocale('zh')}
        className={`px-2 py-1 rounded-md text-xs font-medium transition ${
          locale === 'zh' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
        }`}
      >
        {t('lang.zh')}
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded-md text-xs font-medium transition ${
          locale === 'en' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
        }`}
      >
        EN
      </button>
    </div>
  )
}
