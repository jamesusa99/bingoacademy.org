import { Routes, Route, Outlet } from 'react-router-dom'
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
import ShowcaseSchool from './pages/ShowcaseSchool'
import ShowcaseMaterials from './pages/ShowcaseMaterials'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Community from './pages/Community'
import Tools from './pages/Tools'
import ToolDetail from './pages/ToolDetail'
import Research from './pages/Research'
import Career from './pages/Career'
import Events from './pages/Events'
import Certification from './pages/Certification'
import Mall from './pages/Mall'
import Charity from './pages/Charity'
import Materials from './pages/Materials'
import Study from './pages/Study'
import Profile from './pages/Profile'
import ProfileWorks from './pages/ProfileWorks'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AIAssessment from './pages/AIAssessment'

export default function App() {
  return (
    <Routes>
      {/* Admin routes (no main Layout) */}
      <Route path="/admin" element={<AdminLayout />}>
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
        <Route path="showcase/school" element={<ShowcaseSchool />} />
        <Route path="showcase/materials" element={<ShowcaseMaterials />} />
        <Route path="showcase/venture/:id" element={<ShowcaseCase />} />
        <Route path="showcase/award/:id" element={<ShowcaseCase />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/detail/:id" element={<CourseDetail />} />
        <Route path="community" element={<Community />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/detail/:id" element={<ToolDetail />} />
        <Route path="research" element={<Research />} />
        <Route path="career" element={<Career />} />
        <Route path="events" element={<Events />} />
        <Route path="cert" element={<Certification />} />
        <Route path="mall" element={<Mall />} />
        <Route path="mall/materials" element={<Materials />} />
        <Route path="charity" element={<Charity />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/study" element={<Study />} />
        <Route path="profile/works" element={<ProfileWorks />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="ai-test" element={<AIAssessment />} />
      </Route>
    </Routes>
  )
}
