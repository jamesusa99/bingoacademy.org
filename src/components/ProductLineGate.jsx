import { Navigate } from 'react-router-dom'
import { useProductLineVisibility } from '../contexts/ProductLineVisibilityContext'
import { coursePathForLineId } from '../config/coursePaths'

export default function ProductLineGate({ lineId, children, fallbackTo }) {
  const { isLineVisible, defaultLineId, loading } = useProductLineVisibility()

  if (loading) return children

  if (!isLineVisible(lineId)) {
    return <Navigate to={fallbackTo ?? coursePathForLineId(defaultLineId)} replace />
  }

  return children
}
