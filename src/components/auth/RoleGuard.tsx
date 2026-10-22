import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { roleHome, sessionHome, useAuthStore, type AuthRole } from '@/store/useAuthStore'

interface RoleGuardProps {
  allow: AuthRole[]
  requireVerified?: boolean
}

export function RoleGuard({ allow, requireVerified = false }: RoleGuardProps) {
  const session = useAuthStore((state) => state.session)
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!allow.includes(session.role)) {
    return <Navigate to={roleHome[session.role]} replace />
  }

  if (requireVerified && !session.isVerified) {
    return <Navigate to={sessionHome(session)} replace />
  }

  return <Outlet />
}

export function RootRedirect() {
  const session = useAuthStore((state) => state.session)
  return <Navigate to={session ? sessionHome(session) : '/login'} replace />
}

export function PartnerIndexRedirect() {
  const session = useAuthStore((state) => state.session)
  return <Navigate to={session ? sessionHome(session) : '/login'} replace />
}
