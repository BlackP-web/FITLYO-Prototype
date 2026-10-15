import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { roleHome, useAuthStore, type AuthRole } from '@/store/useAuthStore'

interface RoleGuardProps {
  allow: AuthRole[]
}

export function RoleGuard({ allow }: RoleGuardProps) {
  const session = useAuthStore((state) => state.session)
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!allow.includes(session.role)) {
    return <Navigate to={roleHome[session.role]} replace />
  }

  return <Outlet />
}

export function RootRedirect() {
  const session = useAuthStore((state) => state.session)
  return <Navigate to={session ? roleHome[session.role] : '/login'} replace />
}
