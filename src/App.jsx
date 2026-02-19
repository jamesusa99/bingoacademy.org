import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
import Growth from './pages/Growth'
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

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/showcase/works" element={<ShowcaseWorks />} />
        <Route path="/showcase/awards" element={<ShowcaseAwards />} />
        <Route path="/showcase/school" element={<ShowcaseSchool />} />
        <Route path="/showcase/materials" element={<ShowcaseMaterials />} />
        <Route path="/showcase/venture/:id" element={<ShowcaseCase />} />
        <Route path="/showcase/award/:id" element={<ShowcaseCase />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/detail/:id" element={<CourseDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/detail/:id" element={<ToolDetail />} />
        <Route path="/research" element={<Research />} />
        <Route path="/career" element={<Career />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/events" element={<Events />} />
        <Route path="/cert" element={<Certification />} />
        <Route path="/mall" element={<Mall />} />
        <Route path="/mall/materials" element={<Materials />} />
        <Route path="/charity" element={<Charity />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/study" element={<Study />} />
        <Route path="/profile/works" element={<ProfileWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Layout>
  )
}
