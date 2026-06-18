import { Navigate, useParams } from 'react-router-dom'
import MallSectionHeader from '../../components/admin/mall/MallSectionHeader'
import MallPageSettingsEditor from './mall/MallPageSettingsEditor'
import {
  MALL_ADMIN_LEGACY_REDIRECTS,
  MALL_ADMIN_SECTIONS,
} from '../../config/mallAdminNav'
import { getMallAdminTabConfig } from '../../config/mallTabs'
import AdminCourses from './AdminCourses'
import AdminMallProducts from './AdminMallProducts'

export default function AdminMall() {
  const { section } = useParams()
  const legacyTarget = MALL_ADMIN_LEGACY_REDIRECTS[section]
  if (legacyTarget) {
    return <Navigate to={`/admin/mall/${legacyTarget}`} replace />
  }

  const valid = MALL_ADMIN_SECTIONS.some((s) => s.id === section)
  if (!valid) {
    return <Navigate to="/admin/mall/home" replace />
  }

  const tabConfig = getMallAdminTabConfig(section)

  return (
    <div>
      <MallSectionHeader sectionId={section} />
      <MallPageSettingsEditor sectionId={section} />
      {tabConfig?.sources?.includes('courses') ? (
        <AdminCourses embedded mallTab={section} />
      ) : null}
      {tabConfig?.sources?.includes('products') ? (
        <AdminMallProducts
          embedded
          mallTab={section}
          allowedTypes={tabConfig.productTypes}
          defaultType={tabConfig.defaultProductType}
        />
      ) : null}
    </div>
  )
}
