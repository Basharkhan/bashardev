import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth()
  const location = useLocation()

  if (!isAuthReady) {
    return (
      <section className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 text-center text-white/75">
        Checking admin session...
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}
