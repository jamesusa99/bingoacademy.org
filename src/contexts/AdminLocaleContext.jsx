import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_ADMIN_LOCALE,
  readStoredAdminLocale,
  storeAdminLocale,
  translateAdmin,
} from '../config/adminI18n'

const AdminLocaleContext = createContext(null)

export function AdminLocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredAdminLocale)

  const setLocale = useCallback((next) => {
    const loc = next === 'en' ? 'en' : 'zh'
    setLocaleState(loc)
    storeAdminLocale(loc)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }, [locale])

  const t = useCallback((key, params) => translateAdmin(locale, key, params), [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isZh: locale === 'zh',
    }),
    [locale, setLocale, t]
  )

  return <AdminLocaleContext.Provider value={value}>{children}</AdminLocaleContext.Provider>
}

export function useAdminLocale() {
  const ctx = useContext(AdminLocaleContext)
  if (!ctx) {
    return {
      locale: DEFAULT_ADMIN_LOCALE,
      setLocale: () => {},
      t: (key, params) => translateAdmin(DEFAULT_ADMIN_LOCALE, key, params),
      isZh: DEFAULT_ADMIN_LOCALE === 'zh',
    }
  }
  return ctx
}
