import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminCoursesCatalog from './pages/admin/AdminCoursesCatalog'
import AdminEvents from './pages/admin/AdminEvents'
import AdminForum from './pages/admin/AdminForum'
import AdminHome from './pages/admin/AdminHome'
import AdminShowcase from './pages/admin/AdminShowcase'
import AdminResearch from './pages/admin/AdminResearch'
import AdminCareer from './pages/admin/AdminCareer'
import AdminCert from './pages/admin/AdminCert'
import AdminMallProducts from './pages/admin/AdminMallProducts'
import AdminCharity from './pages/admin/AdminCharity'
import AdminMentors from './pages/admin/AdminMentors'
import AdminVideo from './pages/admin/AdminVideo'
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
import ProductLabs from './pages/ProductLabs'
import AIExploration from './pages/AIExploration'
import AIHideAndSeekPage from './pages/lab/AIHideAndSeekPage'
import AIVirtualConductorPage from './pages/lab/AIVirtualConductorPage'
import WordGravityPage from './pages/lab/WordGravityPage'
import AIJailbreakAdventurePage from './pages/lab/AIJailbreakAdventurePage'
import EvolveAICarPage from './pages/lab/EvolveAICarPage'
import DoodleMonsterPage from './pages/lab/DoodleMonsterPage'
import CourseDetail from './pages/CourseDetail'
import Certification from './pages/Certification'
import Mall from './pages/Mall'
import Study from './pages/Study'
import Profile from './pages/Profile'
import ProfileWorks from './pages/ProfileWorks'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AuthCallback from './pages/AuthCallback'
import AIAssessment from './pages/AIAssessment'
import Community from './pages/Community'

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
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="showcase" element={<AdminShowcase />} />
        <Route path="courses" element={<AdminCoursesCatalog />} />
        <Route path="courses-catalog" element={<Navigate to="/admin/courses" replace />} />
        <Route path="mall" element={<AdminCourses />} />
        <Route path="research" element={<AdminResearch />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="mentors" element={<AdminMentors />} />
        <Route path="career" element={<AdminCareer />} />
        <Route path="cert" element={<AdminCert />} />
        <Route path="mall-products" element={<AdminMallProducts />} />
        <Route path="charity" element={<AdminCharity />} />
        <Route path="forum" element={<AdminForum />} />
        <Route path="video" element={<AdminVideo />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="users" element={<AdminUsers />} />
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
        <Route path="labs" element={<ProductLabs />} />
        <Route path="exploration" element={<AIExploration />} />
        <Route path="exploration/hide-and-seek" element={<AIHideAndSeekPage />} />
        <Route path="exploration/virtual-conductor" element={<AIVirtualConductorPage />} />
        <Route path="exploration/word-gravity" element={<WordGravityPage />} />
        <Route path="exploration/jailbreak-adventure" element={<AIJailbreakAdventurePage />} />
        <Route path="exploration/evolve-car" element={<EvolveAICarPage />} />
        <Route path="exploration/doodle-monsters" element={<DoodleMonsterPage />} />
        <Route path="lab" element={<Navigate to="/labs" replace />} />
        <Route path="lab/hide-and-seek" element={<Navigate to="/exploration/hide-and-seek" replace />} />
        <Route path="lab/virtual-conductor" element={<Navigate to="/exploration/virtual-conductor" replace />} />
        <Route path="lab/word-gravity" element={<Navigate to="/exploration/word-gravity" replace />} />
        <Route path="lab/jailbreak-adventure" element={<Navigate to="/exploration/jailbreak-adventure" replace />} />
        <Route path="lab/evolve-car" element={<Navigate to="/exploration/evolve-car" replace />} />
        <Route path="lab/doodle-monsters" element={<Navigate to="/exploration/doodle-monsters" replace />} />
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
        <Route path="courses/detail/:id" element={<CourseDetail />} />
        <Route path="cert" element={<Certification />} />
        <Route path="mall" element={<Mall />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/study" element={<Study />} />
        <Route path="profile/works" element={<ProfileWorks />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
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
