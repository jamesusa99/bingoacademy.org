import { Navigate } from 'react-router-dom'
import { useProductLineVisibility } from '../contexts/ProductLineVisibilityContext'

export default function ProductLineGate({ lineId, children, fallbackTo }) {
  const { isLineVisible, defaultLineId, loading } = useProductLineVisibility()

  if (loading) return children

  if (!isLineVisible(lineId)) {
    return <Navigate to={fallbackTo ?? `/courses?line=${defaultLineId}`} replace />
  }

  return children
}
