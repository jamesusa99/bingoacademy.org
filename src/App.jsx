import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/AdminLayout'
import { AdminLocaleProvider } from './contexts/AdminLocaleContext'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCoursesCatalog from './pages/admin/AdminCoursesCatalog'
import AdminLabPackExperiments from './pages/admin/AdminLabPackExperiments'
import AdminIOAIExperimentLibrary from './pages/admin/AdminIOAIExperimentLibrary'
import AdminIOAICurriculum from './pages/admin/AdminIOAICurriculum'
import AdminCommunity from './pages/admin/AdminCommunity'
import AdminHome from './pages/admin/AdminHome'
import AdminShowcase from './pages/admin/AdminShowcase'
import AdminCert from './pages/admin/AdminCert'
import AdminMall from './pages/admin/AdminMall'
import AdminPayments from './pages/admin/AdminPayments'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSettings from './pages/admin/AdminSettings'
import Home from './pages/Home'
import Showcase from './pages/Showcase'
import ShowcaseCase from './pages/ShowcaseCase'
import ShowcaseWorks from './pages/ShowcaseWorks'
import ShowcaseAwards from './pages/ShowcaseAwards'
import ShowcaseMaterials from './pages/ShowcaseMaterials'
import Courses from './pages/Courses'
import IOAIModuleDetailPage from './pages/courses/IOAIModuleDetailPage'
import ProductLabs from './pages/ProductLabs'
import LabPackDetail from './pages/labs/LabPackDetail'
import LabExperimentPage from './pages/labs/LabExperimentPage'
import AIExploration from './pages/AIExploration'
import IOAITrainingLabSession from './pages/labs/IOAITrainingLabSession'
import AIHideAndSeekPage from './pages/lab/AIHideAndSeekPage'
import AIVirtualConductorPage from './pages/lab/AIVirtualConductorPage'
import WordGravityPage from './pages/lab/WordGravityPage'
import AIJailbreakAdventurePage from './pages/lab/AIJailbreakAdventurePage'
import EvolveAICarPage from './pages/lab/EvolveAICarPage'
import DoodleMonsterPage from './pages/lab/DoodleMonsterPage'
import AICyberTennisPage from './pages/lab/AICyberTennisPage'
import CourseDetail from './pages/CourseDetail'
import Certification from './pages/Certification'
import Mall from './pages/Mall'
import Study from './pages/Study'
import StudyModulePage from './pages/study/StudyModulePage'
import StudyLessonPage from './pages/study/StudyLessonPage'
import Profile from './pages/Profile'
import ProfileWorks from './pages/ProfileWorks'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import AIAssessment from './pages/AIAssessment'
import Community from './pages/Community'
import Curriculum from './pages/Curriculum'
import IOAIStore from './pages/ioai/IOAIStore'
import IOAILevelPage from './pages/ioai/IOAILevelPage'
import IOAIModulePage from './pages/ioai/IOAIModulePage'
import IOAIPublicExperimentPage from './pages/ioai/IOAIPublicExperimentPage'

const ProgramPage = lazy(() => import('./pages/programs/ProgramPage'))
const Compare = lazy(() => import('./pages/Compare'))

function PageFallback() {
  return <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">Loading…</div>
}

function HashRedirect() {
  const navigate = useNavigate()
  const loc = useLocation()
  useEffect(() => {
    // Hash /#/admin → redirect to /admin when pathname is /
    const hash = window.location.hash
    if ((hash === '#/admin' || hash.startsWith('#/admin/')) && loc.pathname === '/') {
      const target = hash.slice(1)
      navigate(target, { replace: true })
      window.history.replaceState(null, '', target)
    }
  }, [navigate, loc.pathname])
  return null
}

export default function App() {
  return (
    <>
      <HashRedirect />
      <Routes>
      <Route path="/labs/ioai/training-lab/:labId" element={<IOAITrainingLabSession />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/admin/login"
        element={
          <AdminLocaleProvider>
            <AdminLogin />
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
        <Route index element={<AdminDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="showcase" element={<AdminShowcase />} />
        <Route path="labs-materials" element={<AdminCoursesCatalog />} />
        <Route path="labs-materials/:packSlug/experiments" element={<AdminLabPackExperiments />} />
        <Route path="ioai-experiments" element={<AdminIOAIExperimentLibrary />} />
        <Route path="courses" element={<Navigate to="/admin/labs-materials" replace />} />
        <Route path="curriculum/:line" element={<AdminIOAICurriculum />} />
        <Route path="ioai-curriculum" element={<Navigate to="/admin/curriculum/ioai" replace />} />
        <Route path="courses-catalog" element={<Navigate to="/admin/labs-materials" replace />} />
        <Route path="mall" element={<Navigate to="/admin/mall/courses" replace />} />
        <Route path="mall/:section" element={<AdminMall />} />
        <Route path="mentors" element={<Navigate to="/admin/community/mentors" replace />} />
        <Route path="cert" element={<AdminCert />} />
        <Route path="mall-products" element={<Navigate to="/admin/mall/products" replace />} />
        <Route path="forum" element={<Navigate to="/admin/community/forum" replace />} />
        <Route path="community" element={<Navigate to="/admin/community/home" replace />} />
        <Route path="community/:section" element={<AdminCommunity />} />
        <Route path="video" element={<Navigate to="/admin/curriculum/ioai" replace />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      {/* Main site routes */}
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Home />} />
        <Route path="showcase" element={<Showcase />} />
        <Route path="showcase/works" element={<ShowcaseWorks />} />
        <Route path="showcase/awards" element={<ShowcaseAwards />} />
        <Route path="showcase/school" element={<Navigate to="/showcase" replace />} />
        <Route path="showcase/materials" element={<ShowcaseMaterials />} />
        <Route path="showcase/venture/:id" element={<ShowcaseCase />} />
        <Route path="showcase/award/:id" element={<ShowcaseCase />} />
        <Route path="assessment" element={<AIAssessment />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/module/:moduleSlug" element={<IOAIModuleDetailPage />} />
        <Route path="ioai" element={<Navigate to="/courses?line=ioai" replace />} />
        <Route path="ioai/l1/:levelSlug" element={<IOAILevelPage />} />
        <Route path="ioai/l3/:moduleSlug" element={<IOAIModulePage />} />
        <Route path="ioai/experiments/:slug" element={<IOAIPublicExperimentPage />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="labs" element={<ProductLabs />} />
        <Route path="labs/pack/:slug" element={<LabPackDetail />} />
        <Route path="labs/pack/:slug/experiments/:experimentSlug" element={<LabExperimentPage />} />
        <Route path="exploration" element={<AIExploration />} />
        <Route path="exploration/hide-and-seek" element={<AIHideAndSeekPage />} />
        <Route path="exploration/virtual-conductor" element={<AIVirtualConductorPage />} />
        <Route path="exploration/word-gravity" element={<WordGravityPage />} />
        <Route path="exploration/jailbreak-adventure" element={<AIJailbreakAdventurePage />} />
        <Route path="exploration/evolve-car" element={<EvolveAICarPage />} />
        <Route path="exploration/doodle-monsters" element={<DoodleMonsterPage />} />
        <Route path="exploration/cyber-tennis" element={<AICyberTennisPage />} />
        <Route path="lab" element={<Navigate to="/labs" replace />} />
        <Route path="lab/hide-and-seek" element={<Navigate to="/exploration/hide-and-seek" replace />} />
        <Route path="lab/virtual-conductor" element={<Navigate to="/exploration/virtual-conductor" replace />} />
        <Route path="lab/word-gravity" element={<Navigate to="/exploration/word-gravity" replace />} />
        <Route path="lab/jailbreak-adventure" element={<Navigate to="/exploration/jailbreak-adventure" replace />} />
        <Route path="lab/evolve-car" element={<Navigate to="/exploration/evolve-car" replace />} />
        <Route path="lab/doodle-monsters" element={<Navigate to="/exploration/doodle-monsters" replace />} />
        <Route path="lab/cyber-tennis" element={<Navigate to="/exploration/cyber-tennis" replace />} />
        <Route path="pricing" element={<Navigate to="/cert" replace />} />
        <Route
          path="programs/:slug"
          element={
            <Suspense fallback={<PageFallback />}>
              <ProgramPage />
            </Suspense>
          }
        />
        <Route
          path="compare"
          element={
            <Suspense fallback={<PageFallback />}>
              <Compare />
            </Suspense>
          }
        />
        <Route path="community" element={<Community />} />
        <Route path="community/:section" element={<Community />} />
        <Route path="courses/detail/:id" element={<CourseDetail />} />
        <Route path="cert" element={<Certification />} />
        <Route path="mall" element={<Mall />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/study" element={<Study />} />
        <Route path="profile/study/module/:moduleSlug" element={<StudyModulePage />} />
        <Route path="profile/study/lesson/:lessonId" element={<StudyLessonPage />} />
        <Route path="profile/works" element={<ProfileWorks />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        {/* Legacy routes → new product structure */}
        <Route path="research" element={<Navigate to="/programs/ioai" replace />} />
        <Route path="events" element={<Navigate to="/programs/ioai" replace />} />
        <Route path="career" element={<Navigate to="/programs/k12" replace />} />
        <Route path="charity" element={<Navigate to="/" replace />} />
        <Route path="tools" element={<Navigate to="/mall" replace />} />
        <Route path="tools/detail/:id" element={<Navigate to="/mall" replace />} />
        <Route path="ai-test" element={<Navigate to="/assessment" replace />} />
        <Route path="mall/materials" element={<Navigate to="/mall" replace />} />
      </Route>
    </Routes>
    </>
  )
}
