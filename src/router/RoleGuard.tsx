import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import type { TUserRole } from '../types/user.type'
import { isRouteAllowed } from './routePermissions'

type TRoleGuardProps = {
  allowedRoles?: TUserRole[]
}

export function RoleGuard({ allowedRoles }: TRoleGuardProps) {
  const { user } = useAuthStore()
  const location = useLocation()

  // 1. If explicit allowedRoles prop passed
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role as TUserRole)) {
      return <Navigate to="/403" replace />
    }
  }

  // 2. Fallback check using routePermissionsConfig map
  if (user && !isRouteAllowed(location.pathname, user.role as TUserRole)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
