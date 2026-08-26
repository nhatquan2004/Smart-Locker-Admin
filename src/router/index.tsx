import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { DashboardPage } from '../pages/Dashboard'
import { LockersPage } from '../pages/Lockers'
import { AdminLayout } from '../components/layout/AdminLayout'
import { ShipmentsPage } from '../pages/Shipments'
import { UsersPage } from '../pages/Users'
import { ResidentsPage } from '../pages/Residents'
import { LockerDetailPage } from "../pages/Lockers/LockerDetail"
import { LockerHardwarePage } from '../pages/Lockers/LockerHardware'
import { LockerRemoteControlPage } from "../pages/Lockers/LockerRemoteControl"
import { ShipmentDetailPage } from "../pages/Shipments/ShipmentDetail"
import { ShipmentOtpPage } from "../pages/Shipments/ShipmentOtp"
import { UserDetailPage } from "../pages/Users/UserDetail"
import { UserManagePage } from "../pages/Users/UserManage"
import { UserHistoryPage } from "../pages/Users/UserHistory"
import { SettingsPage } from "../pages/Settings"
import { ActivitiesPage } from "../pages/Activities"
import { OrganizationsPage } from '../pages/Organizations'
import { OrganizationDetailPage } from '../pages/Organizations/OrganizationDetail'
import { LoginPage } from '../pages/Auth/LoginPage'
import { RegisterPage } from '../pages/Auth/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'organizations/:orgId', element: <OrganizationDetailPage /> },
          { path: 'residents', element: <ResidentsPage /> },
          { path: 'activities', element: <ActivitiesPage /> },
          { path: 'lockers', element: <LockersPage /> },
          { path: 'lockers/:lockerId', element: <LockerDetailPage /> },
          { path: 'lockers/:lockerId/hardware', element: <LockerHardwarePage /> },
          { path: 'lockers/:lockerId/remote-control', element: <LockerRemoteControlPage /> },
          { path: 'shipments', element: <ShipmentsPage /> },
          { path: 'shipments/:shipmentId', element: <ShipmentDetailPage /> },
          { path: 'shipments/:shipmentId/otp', element: <ShipmentOtpPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'users/:userId', element: <UserDetailPage /> },
          { path: 'users/:userId/manage', element: <UserManagePage /> },
          { path: 'users/:userId/history', element: <UserHistoryPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
