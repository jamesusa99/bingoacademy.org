import { Navigate } from 'react-router-dom'

/** @deprecated Use /labs (product labs) or /exploration (free games) */
export default function AILab() {
  return <Navigate to="/labs" replace />
}
