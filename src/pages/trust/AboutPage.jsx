import PageMeta from '../../components/PageMeta'
import AboutPageContent from '../../components/about/AboutPageContent'
import { ABOUT_PAGE_META } from '../../config/aboutPage'
import { aboutPageGraph } from '../../config/structuredData'
import { SITE_URL } from '../../config/siteSeo'

export default function AboutPage() {
  return (
    <div className="w-full">
      <PageMeta
        title={ABOUT_PAGE_META.title}
        description={ABOUT_PAGE_META.description}
        canonical={`${SITE_URL}/about`}
        jsonLd={aboutPageGraph()}
      />

      <AboutPageContent />
    </div>
  )
}
