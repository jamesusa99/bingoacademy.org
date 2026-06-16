import { Link } from 'react-router-dom'
import { MALL_ADMIN_SECTIONS } from '../../../config/mallAdminNav'
import { useAdminCrud } from '../../../hooks/useAdminCrud'

export default function MallSectionHeader({ sectionId }) {
  const c = useAdminCrud()
  const section = MALL_ADMIN_SECTIONS.find((s) => s.id === sectionId)
  const titleKey = section ? `pages.mall.section.${sectionId}` : 'pages.mall.title'
  const descKey = section ? `pages.mall.sectionDesc.${sectionId}` : 'pages.mall.desc'

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-bingo-dark">{c.t(titleKey)}</h1>
        <Link
          to="/mall"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline shrink-0"
        >
          {c.t('pages.mall.previewFront')} ↗
        </Link>
      </div>
      <p className="text-slate-600 text-sm">{c.t(descKey)}</p>
    </div>
  )
}
