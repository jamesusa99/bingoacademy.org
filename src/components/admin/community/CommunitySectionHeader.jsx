import { Link } from 'react-router-dom'
import { COMMUNITY_ADMIN_SECTIONS } from '../../../config/communityAdminNav'
import { useAdminCrud } from '../../../hooks/useAdminCrud'

export default function CommunitySectionHeader({ sectionId }) {
  const c = useAdminCrud()
  const section = COMMUNITY_ADMIN_SECTIONS.find((s) => s.id === sectionId)
  const titleKey = section ? `pages.community.section.${sectionId}` : 'pages.community.title'
  const descKey = section ? `pages.community.sectionDesc.${sectionId}` : 'pages.community.desc'

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-bingo-dark">{c.t(titleKey)}</h1>
        <Link
          to="/community"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline shrink-0"
        >
          {c.t('pages.community.previewFront')} ↗
        </Link>
      </div>
      <p className="text-slate-600 text-sm">{c.t(descKey)}</p>
    </div>
  )
}
