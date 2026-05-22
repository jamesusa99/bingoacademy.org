import { useEffect } from 'react'
import { Routes, Route, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
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
import Home from './pages/Home'
import Showcase from './pages/Showcase'
import ShowcaseCase from './pages/ShowcaseCase'
import ShowcaseWorks from './pages/ShowcaseWorks'
import ShowcaseAwards from './pages/ShowcaseAwards'
import ShowcaseMaterials from './pages/ShowcaseMaterials'
import Courses from './pages/Courses'
import AILab from './pages/AILab'
import AIHideAndSeekPage from './pages/lab/AIHideAndSeekPage'
import CourseDetail from './pages/CourseDetail'
import Certification from './pages/Certification'
import Mall from './pages/Mall'
import Study from './pages/Study'
import Profile from './pages/Profile'
import ProfileWorks from './pages/ProfileWorks'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

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
      {/* Admin routes - path="/admin/*" ensures /admin and /admin/xxx are never matched by path="/" */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="showcase" element={<AdminShowcase />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="research" element={<AdminResearch />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="mentors" element={<AdminMentors />} />
        <Route path="career" element={<AdminCareer />} />
        <Route path="cert" element={<AdminCert />} />
        <Route path="mall-products" element={<AdminMallProducts />} />
        <Route path="charity" element={<AdminCharity />} />
        <Route path="forum" element={<AdminForum />} />
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
        <Route path="courses" element={<Courses />} />
        <Route path="lab" element={<AILab />} />
        <Route path="lab/hide-and-seek" element={<AIHideAndSeekPage />} />
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
        <Route path="research" element={<Navigate to="/courses?line=ioai" replace />} />
        <Route path="events" element={<Navigate to="/courses?line=ioai" replace />} />
        <Route path="community" element={<Navigate to="/" replace />} />
        <Route path="career" element={<Navigate to="/courses?line=k12" replace />} />
        <Route path="charity" element={<Navigate to="/" replace />} />
        <Route path="tools" element={<Navigate to="/mall" replace />} />
        <Route path="tools/detail/:id" element={<Navigate to="/mall" replace />} />
        <Route path="ai-test" element={<Navigate to="/courses" replace />} />
        <Route path="mall/materials" element={<Navigate to="/mall" replace />} />
      </Route>
    </Routes>
    </>
  )
}
