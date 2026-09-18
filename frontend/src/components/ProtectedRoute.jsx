import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '../authStorage'

function ProtectedRoute({ children, roles }) {
  const location = useLocation()
  const session = getSession()

  if (!session?.accessToken && !session?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles?.length && !roles.includes(session.user?.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default ProtectedRoute
