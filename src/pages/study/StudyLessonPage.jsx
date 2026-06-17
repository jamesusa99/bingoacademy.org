import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authLink } from '../../lib/authRedirect'
import CourseDetail from '../CourseDetail'

/** Lesson player within Study Center (owned content). */
export default function StudyLessonPage() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to={authLink('/login', returnTo)} replace />
  }

  return <CourseDetail studyCenter />
}
