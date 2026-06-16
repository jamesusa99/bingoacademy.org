import { Navigate, useParams } from 'react-router-dom'
import CommunitySectionHeader from '../../components/admin/community/CommunitySectionHeader'
import { COMMUNITY_ADMIN_SECTIONS } from '../../config/communityAdminNav'
import AdminForum from './AdminForum'
import AdminMentors from './AdminMentors'
import CommunityHomeEditor from './community/CommunityHomeEditor'
import CommunityScholarsEditor from './community/CommunityScholarsEditor'
import CommunityCheckinEditor from './community/CommunityCheckinEditor'
import CommunityPartnersEditor from './community/CommunityPartnersEditor'
import CommunityCoursesEditor from './community/CommunityCoursesEditor'

export default function AdminCommunity() {
  const { section } = useParams()
  const valid = COMMUNITY_ADMIN_SECTIONS.some((s) => s.id === section)

  if (!valid) {
    return <Navigate to="/admin/community/home" replace />
  }

  return (
    <div>
      <CommunitySectionHeader sectionId={section} />
      {section === 'home' && <CommunityHomeEditor />}
      {section === 'forum' && <AdminForum embedded />}
      {section === 'scholars' && <CommunityScholarsEditor />}
      {section === 'courses' && <CommunityCoursesEditor />}
      {section === 'mentors' && <AdminMentors embedded />}
      {section === 'partners' && <CommunityPartnersEditor />}
      {section === 'checkin' && <CommunityCheckinEditor />}
    </div>
  )
}
