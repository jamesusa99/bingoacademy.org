import { Navigate, useParams } from 'react-router-dom'
import MallSectionHeader from '../../components/admin/mall/MallSectionHeader'
import { MALL_ADMIN_SECTIONS } from '../../config/mallAdminNav'
import AdminCourses from './AdminCourses'
import AdminMallProducts from './AdminMallProducts'

export default function AdminMall() {
  const { section } = useParams()
  const valid = MALL_ADMIN_SECTIONS.some((s) => s.id === section)

  if (!valid) {
    return <Navigate to="/admin/mall/courses" replace />
  }

  return (
    <div>
      <MallSectionHeader sectionId={section} />
      {section === 'courses' && <AdminCourses embedded />}
      {section === 'products' && <AdminMallProducts embedded />}
    </div>
  )
}
