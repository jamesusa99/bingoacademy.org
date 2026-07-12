import { useEffect, Suspense } from 'react'
import { Routes, Route, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProductLineGate from './components/ProductLineGate'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/AdminLayout'
import { AdminLocaleProvider } from './contexts/AdminLocaleContext'
import RouteFallback from './components/RouteFallback'
import ScrollToTop from './components/ScrollToTop'
import useAnalyticsPageView from './hooks/useAnalyticsPageView'
import * as Pages from './routes/lazyPages'

function HashRedirect() {
  const navigate = useNavigate()
  const loc = useLocation()
  useEffect(() => {
    const hash = window.location.hash
    if ((hash === '#/admin' || hash.startsWith('#/admin/')) && loc.pathname === '/') {
      const target = hash.slice(1)
      navigate(target, { replace: true })
      window.history.replaceState(null, '', target)
    }
  }, [navigate, loc.pathname])
  return null
}

function LazyOutlet() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Outlet />
    </Suspense>
  )
}

export default function App() {
  useAnalyticsPageView()

  return (
    <>
      <HashRedirect />
      <ScrollToTop />
      <Routes>
        <Route
          path="/labs/ioai/training-lab/:labId"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Pages.IOAITrainingLabSession />
            </Suspense>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Pages.AuthCallback />
            </Suspense>
          }
        />
        <Route
          path="/admin/login"
          element={
            <AdminLocaleProvider>
              <Suspense fallback={<RouteFallback />}>
                <Pages.AdminLogin />
              </Suspense>
            </AdminLocaleProvider>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminLocaleProvider>
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            </AdminLocaleProvider>
          }
        >
          <Route index element={<Pages.AdminDashboard />} />
          <Route path="settings" element={<Pages.AdminSettings />} />
          <Route path="home" element={<Pages.AdminHome />} />
          <Route path="showcase" element={<Pages.AdminShowcase />} />
          <Route path="news" element={<Pages.AdminNews />} />
          <Route path="labs-materials" element={<Pages.AdminCoursesCatalog />} />
          <Route path="labs-materials/:packSlug/experiments" element={<Pages.AdminLabPackExperiments />} />
          <Route path="ioai-experiments" element={<Pages.AdminIOAIExperimentLibrary />} />
          <Route path="courses" element={<Navigate to="/admin/labs-materials" replace />} />
          <Route path="curriculum/:line/bundles" element={<Pages.AdminProgramCourseBundles />} />
          <Route path="curriculum/:line" element={<Pages.AdminIOAICurriculum />} />
          <Route path="ioai-curriculum" element={<Navigate to="/admin/curriculum/ioai" replace />} />
          <Route path="courses-catalog" element={<Navigate to="/admin/labs-materials" replace />} />
          <Route path="mall" element={<Navigate to="/admin/mall/home" replace />} />
          <Route path="mall/:section" element={<Pages.AdminMall />} />
          <Route path="mentors" element={<Navigate to="/admin/community/mentors" replace />} />
          <Route path="cert" element={<Pages.AdminCert />} />
          <Route path="mall-products" element={<Navigate to="/admin/mall/materials" replace />} />
          <Route path="forum" element={<Navigate to="/admin/community/forum" replace />} />
          <Route path="community" element={<Navigate to="/admin/community/home" replace />} />
          <Route path="community/:section" element={<Pages.AdminCommunity />} />
          <Route path="video" element={<Navigate to="/admin/curriculum/ioai" replace />} />
          <Route path="payments" element={<Pages.AdminPayments />} />
          <Route path="users" element={<Pages.AdminUsers />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route
          path="/try-ai"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Pages.TryAiLanding />
            </Suspense>
          }
        />
        <Route
          path="/ioai-masterclass"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Pages.IOAIMasterclassLanding />
            </Suspense>
          }
        />
        <Route
          path="/ai-classes-for-kids"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Pages.UsParentsLanding />
            </Suspense>
          }
        />
        <Route
          path="/usaaio-prep"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Pages.UsaaioPrepLanding />
            </Suspense>
          }
        />

        <Route path="/" element={<Layout><LazyOutlet /></Layout>}>
          <Route index element={<Pages.Home />} />
          <Route path="showcase" element={<Pages.Showcase />} />
          <Route path="showcase/works" element={<Pages.ShowcaseWorks />} />
          <Route path="showcase/awards" element={<Pages.ShowcaseAwards />} />
          <Route path="showcase/school" element={<Navigate to="/showcase" replace />} />
          <Route path="showcase/materials" element={<Pages.ShowcaseMaterials />} />
          <Route path="showcase/venture/:id" element={<Pages.ShowcaseCase />} />
          <Route path="showcase/award/:id" element={<Pages.ShowcaseCase />} />
          <Route path="assessment" element={<Pages.AIAssessment />} />
          <Route
            path="courses/module/:moduleSlug"
            element={
              <ProductLineGate lineId="ioai">
                <Pages.IOAIModuleDetailPage />
              </ProductLineGate>
            }
          />
          <Route path="courses/detail/:id/golab" element={<Pages.GoLabPage />} />
          <Route path="courses/detail/:id" element={<Pages.CourseDetail />} />
          <Route path="courses/:lineSlug/:subSlug" element={<Pages.Courses />} />
          <Route path="courses/:lineSlug" element={<Pages.Courses />} />
          <Route path="courses" element={<Pages.Courses />} />
          <Route
            path="ioai"
            element={
              <ProductLineGate lineId="ioai">
                <Navigate to="/courses/ioai" replace />
              </ProductLineGate>
            }
          />
          <Route
            path="ioai/l1/:levelSlug"
            element={
              <ProductLineGate lineId="ioai">
                <Pages.IOAILevelPage />
              </ProductLineGate>
            }
          />
          <Route
            path="ioai/l3/:moduleSlug"
            element={
              <ProductLineGate lineId="ioai">
                <Pages.IOAIModulePage />
              </ProductLineGate>
            }
          />
          <Route
            path="ioai/experiments/:slug"
            element={
              <ProductLineGate lineId="ioai">
                <Pages.IOAIPublicExperimentPage />
              </ProductLineGate>
            }
          />
          <Route path="curriculum" element={<Pages.Curriculum />} />
          <Route path="labs" element={<Pages.ProductLabs />} />
          <Route path="labs/pack/:slug" element={<Pages.LabPackDetail />} />
          <Route path="labs/pack/:slug/experiments/:experimentSlug" element={<Pages.LabExperimentPage />} />
          <Route path="exploration" element={<Pages.AIExploration />} />
          <Route path="exploration/hide-and-seek" element={<Pages.AIHideAndSeekPage />} />
          <Route path="exploration/virtual-conductor" element={<Pages.AIVirtualConductorPage />} />
          <Route path="exploration/word-gravity" element={<Pages.WordGravityPage />} />
          <Route path="exploration/jailbreak-adventure" element={<Pages.AIJailbreakAdventurePage />} />
          <Route path="exploration/evolve-car" element={<Pages.EvolveAICarPage />} />
          <Route path="exploration/doodle-monsters" element={<Pages.DoodleMonsterPage />} />
          <Route path="exploration/cyber-tennis" element={<Pages.AICyberTennisPage />} />
          <Route path="lab" element={<Navigate to="/labs" replace />} />
          <Route path="lab/hide-and-seek" element={<Navigate to="/exploration/hide-and-seek" replace />} />
          <Route path="lab/virtual-conductor" element={<Navigate to="/exploration/virtual-conductor" replace />} />
          <Route path="lab/word-gravity" element={<Navigate to="/exploration/word-gravity" replace />} />
          <Route path="lab/jailbreak-adventure" element={<Navigate to="/exploration/jailbreak-adventure" replace />} />
          <Route path="lab/evolve-car" element={<Navigate to="/exploration/evolve-car" replace />} />
          <Route path="lab/doodle-monsters" element={<Navigate to="/exploration/doodle-monsters" replace />} />
          <Route path="lab/cyber-tennis" element={<Navigate to="/exploration/cyber-tennis" replace />} />
          <Route path="pricing" element={<Navigate to="/cert" replace />} />
          <Route path="programs/:slug" element={<Pages.ProgramPage />} />
          <Route path="compare" element={<Pages.Compare />} />
          <Route path="community" element={<Pages.Community />} />
          <Route path="community/:section" element={<Pages.Community />} />
          <Route path="cert" element={<Pages.Certification />} />
          <Route path="mall" element={<Pages.Mall />} />
          <Route path="privacy" element={<Pages.Privacy />} />
          <Route path="about" element={<Pages.AboutPage />} />
          <Route path="instructors" element={<Pages.InstructorsHub />} />
          <Route path="instructors/:slug" element={<Pages.InstructorDetailPage />} />
          <Route path="methodology" element={<Pages.MethodologyPage />} />
          <Route path="outcomes" element={<Pages.OutcomesPage />} />
          <Route path="case-studies" element={<Navigate to="/outcomes" replace />} />
          <Route path="safety-and-privacy" element={<Pages.SafetyPrivacyPage />} />
          <Route path="news" element={<Pages.News />} />
          <Route path="news/:slug" element={<Pages.NewsArticle />} />
          <Route path="guides" element={<Pages.GuidesHub />} />
          <Route path="guides/evidence" element={<Pages.EvidenceHub />} />
          <Route path="guides/:cluster" element={<Pages.GuideClusterPage />} />
          <Route path="guides/:cluster/:slug" element={<Pages.GuideArticlePage />} />
          <Route path="profile" element={<Pages.Profile />} />
          <Route path="profile/study" element={<Pages.Study />} />
          <Route path="profile/study/module/:moduleSlug" element={<Pages.StudyModulePage />} />
          <Route path="profile/study/lesson/:lessonId/golab" element={<Pages.GoLabPage studyCenter />} />
          <Route path="profile/study/lesson/:lessonId" element={<Pages.StudyLessonPage />} />
          <Route path="profile/works" element={<Pages.ProfileWorks />} />
          <Route path="login" element={<Pages.Login />} />
          <Route path="register" element={<Pages.Register />} />
          <Route path="forgot-password" element={<Pages.ForgotPassword />} />
          <Route path="reset-password" element={<Pages.ResetPassword />} />
          <Route path="research" element={<Navigate to="/programs/ioai" replace />} />
          <Route path="events" element={<Navigate to="/programs/ioai" replace />} />
          <Route path="career" element={<Navigate to="/programs/ioai" replace />} />
          <Route path="charity" element={<Pages.NotFound status={410} />} />
          <Route path="tools" element={<Navigate to="/mall" replace />} />
          <Route path="tools/detail/:id" element={<Navigate to="/mall" replace />} />
          <Route path="ai-test" element={<Navigate to="/assessment" replace />} />
          <Route path="mall/materials" element={<Navigate to="/mall" replace />} />
          <Route path="*" element={<Pages.NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
