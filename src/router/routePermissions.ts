import type { TUserRole } from '../types/user.type'

export type TRoutePermission = {
  path: string
  allowedRoles: TUserRole[]
}

/**
 * Route permissions configuration
 * Defines allowed roles for restricted routes in Smart Locker Admin
 */
export const RoutePermissionsConfig = {
  permissions: [
    { path: '/organizations', allowedRoles: ['super_admin'] as TUserRole[] },
    { path: '/organizations/:orgId', allowedRoles: ['super_admin'] as TUserRole[] },
    { path: '/settings', allowedRoles: ['super_admin'] as TUserRole[] },
  ],
}

export function isRouteAllowed(pathname: string, userRole?: TUserRole): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true

  for (const perm of RoutePermissionsConfig.permissions) {
    const regexPath = new RegExp('^' + perm.path.replace(/:[^\s/]+/g, '[^/]+') + '$')
    if (regexPath.test(pathname)) {
      return perm.allowedRoles.includes(userRole)
    }
  }

  return true
}
