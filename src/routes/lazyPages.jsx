import { lazy } from 'react'

/** Core marketing — keep separate from heavy app surfaces */
export const Home = lazy(() => import('../pages/Home'))
export const Showcase = lazy(() => import('../pages/Showcase'))
export const ShowcaseCase = lazy(() => import('../pages/ShowcaseCase'))
export const ShowcaseWorks = lazy(() => import('../pages/ShowcaseWorks'))
export const ShowcaseAwards = lazy(() => import('../pages/ShowcaseAwards'))
export const ShowcaseMaterials = lazy(() => import('../pages/ShowcaseMaterials'))
export const News = lazy(() => import('../pages/News'))
export const NewsArticle = lazy(() => import('../pages/NewsArticle'))
export const Privacy = lazy(() => import('../pages/Privacy'))
export const Certification = lazy(() => import('../pages/Certification'))
export const Mall = lazy(() => import('../pages/Mall'))
export const Community = lazy(() => import('../pages/Community'))
export const AIAssessment = lazy(() => import('../pages/AIAssessment'))
export const NotFound = lazy(() => import('../pages/NotFound'))

/** Channel landings */
export const TryAiLanding = lazy(() => import('../pages/landing/TryAiLanding'))
export const IOAIMasterclassLanding = lazy(() => import('../pages/landing/IOAIMasterclassLanding'))
export const UsParentsLanding = lazy(() => import('../pages/landing/UsParentsLanding'))
export const UsaaioPrepLanding = lazy(() => import('../pages/landing/UsaaioPrepLanding'))

/** Courses & study */
export const Courses = lazy(() => import('../pages/Courses'))
export const CourseDetail = lazy(() => import('../pages/CourseDetail'))
export const IOAIModuleDetailPage = lazy(() => import('../pages/courses/IOAIModuleDetailPage'))
export const Curriculum = lazy(() => import('../pages/Curriculum'))
export const Study = lazy(() => import('../pages/Study'))
export const StudyModulePage = lazy(() => import('../pages/study/StudyModulePage'))
export const StudyLessonPage = lazy(() => import('../pages/study/StudyLessonPage'))
export const ProgramPage = lazy(() => import('../pages/programs/ProgramPage'))
export const Compare = lazy(() => import('../pages/Compare'))

/** IOAI public surfaces */
export const IOAILevelPage = lazy(() => import('../pages/ioai/IOAILevelPage'))
export const IOAIModulePage = lazy(() => import('../pages/ioai/IOAIModulePage'))
export const IOAIPublicExperimentPage = lazy(() => import('../pages/ioai/IOAIPublicExperimentPage'))

/** Labs storefront */
export const ProductLabs = lazy(() => import('../pages/ProductLabs'))
export const LabPackDetail = lazy(() => import('../pages/labs/LabPackDetail'))
export const LabExperimentPage = lazy(() => import('../pages/labs/LabExperimentPage'))
export const AIExploration = lazy(() => import('../pages/AIExploration'))

/** Code runtime — Pyodide + CodeMirror (load only on GoLab / training lab) */
export const GoLabPage = lazy(() => import('../pages/GoLabPage'))
export const IOAITrainingLabSession = lazy(() => import('../pages/labs/IOAITrainingLabSession'))

/** Exploration labs — TensorFlow, Matter.js, AI SDK (load only when entering a lab) */
export const AIHideAndSeekPage = lazy(() => import('../pages/lab/AIHideAndSeekPage'))
export const AIVirtualConductorPage = lazy(() => import('../pages/lab/AIVirtualConductorPage'))
export const WordGravityPage = lazy(() => import('../pages/lab/WordGravityPage'))
export const AIJailbreakAdventurePage = lazy(() => import('../pages/lab/AIJailbreakAdventurePage'))
export const EvolveAICarPage = lazy(() => import('../pages/lab/EvolveAICarPage'))
export const DoodleMonsterPage = lazy(() => import('../pages/lab/DoodleMonsterPage'))
export const AICyberTennisPage = lazy(() => import('../pages/lab/AICyberTennisPage'))

/** Trust & GEO guides */
export const GuidesHub = lazy(() => import('../pages/guides/GuidesHub'))
export const GuideClusterPage = lazy(() => import('../pages/guides/GuideClusterPage'))
export const GuideArticlePage = lazy(() => import('../pages/guides/GuideArticlePage'))
export const EvidenceHub = lazy(() => import('../pages/guides/EvidenceHub'))
export const AboutPage = lazy(() => import('../pages/trust/AboutPage'))
export const InstructorsHub = lazy(() => import('../pages/trust/InstructorsHub'))
export const InstructorDetailPage = lazy(() => import('../pages/trust/InstructorDetailPage'))
export const MethodologyPage = lazy(() => import('../pages/trust/MethodologyPage'))
export const OutcomesPage = lazy(() => import('../pages/trust/OutcomesPage'))
export const SafetyPrivacyPage = lazy(() => import('../pages/trust/SafetyPrivacyPage'))

/** Auth & account */
export const Profile = lazy(() => import('../pages/Profile'))
export const ProfileWorks = lazy(() => import('../pages/ProfileWorks'))
export const Login = lazy(() => import('../pages/Login'))
export const Register = lazy(() => import('../pages/Register'))
export const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
export const ResetPassword = lazy(() => import('../pages/ResetPassword'))
export const AuthCallback = lazy(() => import('../pages/AuthCallback'))

/** Admin — isolated chunk; never loaded on public marketing paths */
export const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'))
export const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
export const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'))
export const AdminHome = lazy(() => import('../pages/admin/AdminHome'))
export const AdminShowcase = lazy(() => import('../pages/admin/AdminShowcase'))
export const AdminNews = lazy(() => import('../pages/admin/AdminNews'))
export const AdminCoursesCatalog = lazy(() => import('../pages/admin/AdminCoursesCatalog'))
export const AdminLabPackExperiments = lazy(() => import('../pages/admin/AdminLabPackExperiments'))
export const AdminIOAIExperimentLibrary = lazy(() => import('../pages/admin/AdminIOAIExperimentLibrary'))
export const AdminIOAICurriculum = lazy(() => import('../pages/admin/AdminIOAICurriculum'))
export const AdminProgramCourseBundles = lazy(() => import('../pages/admin/AdminProgramCourseBundles'))
export const AdminMall = lazy(() => import('../pages/admin/AdminMall'))
export const AdminCert = lazy(() => import('../pages/admin/AdminCert'))
export const AdminCommunity = lazy(() => import('../pages/admin/AdminCommunity'))
export const AdminPayments = lazy(() => import('../pages/admin/AdminPayments'))
export const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))
