import { useMemo } from 'react'
import { useAdminLocale } from '../contexts/AdminLocaleContext'

/** Shared CRUD labels for admin secondary pages */
export function useAdminCrud() {
  const { t, locale, setLocale, isZh } = useAdminLocale()

  return useMemo(
    () => ({
      t,
      locale,
      setLocale,
      isZh,
      save: t('crud.save'),
      saving: t('crud.saving'),
      cancel: t('crud.cancel'),
      delete: t('crud.delete'),
      edit: t('crud.edit'),
      add: t('crud.add'),
      loading: t('crud.loading'),
      empty: t('crud.empty'),
      noItemsYet: t('crud.noItemsYet'),
      actions: t('crud.actions'),
      name: t('crud.name'),
      title: t('crud.title'),
      type: t('crud.type'),
      status: t('crud.status'),
      price: t('crud.price'),
      company: t('crud.company'),
      salary: t('crud.salary'),
      yes: t('crud.yes'),
      no: t('crud.no'),
      addNew: t('crud.addNew'),
      previewOnSite: t('crud.previewOnSite'),
      confirmDelete: (what) => t('crud.confirmDelete', { what: what || t('crud.thisItem') }),
      confirmDeleteGeneric: () => t('crud.confirmDeleteGeneric'),
      editItem: (item) => t('crud.editItem', { item }),
      addItem: (item) => t('crud.addItem', { item }),
      pageTitle: (pageKey) => t(`pages.${pageKey}.title`),
      pageDesc: (pageKey) => t(`pages.${pageKey}.desc`),
    }),
    [t, locale, setLocale, isZh]
  )
}
