import HomeHero from '../components/home/HomeHero'
import HomeTuitionSection from '../components/home/HomeTuitionSection'
import {
  HomeQuickFactsSection,
  HomeWhyProgramSection,
  HomeCurriculumRoadmapSection,
  HomeHowLearningWorksSection,
  HomePlatformSection,
  HomeStudentWorkSection,
  HomeAudienceSection,
  HomeInstructorsSection,
  HomeFaqSection,
  HomeFinalCtaSection,
} from '../components/home/HomePageSections'
import PageMeta from '../components/PageMeta'
import { ORG_JSON_LD, PAGE_SEO } from '../config/programs'
import { buildPageGraph, organizationEntity, websiteEntity } from '../config/structuredData'
import { HOME_FAQ } from '../config/homePage'

const HOME_JSON_LD = buildPageGraph({
  pageUrl: '/',
  faq: HOME_FAQ.items,
  entities: [organizationEntity(), websiteEntity()],
})

export default function Home() {
  return (
    <div className="w-full">
      <PageMeta
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        keywords={PAGE_SEO.home.keywords}
        jsonLd={HOME_JSON_LD}
      />

      <HomeHero />
      <HomeQuickFactsSection />
      <HomeWhyProgramSection />
      <HomeCurriculumRoadmapSection />
      <HomeHowLearningWorksSection />
      <HomePlatformSection />
      <HomeStudentWorkSection />
      <HomeAudienceSection />
      <HomeInstructorsSection />
      <HomeTuitionSection />
      <HomeFaqSection />
      <HomeFinalCtaSection />
    </div>
  )
}
