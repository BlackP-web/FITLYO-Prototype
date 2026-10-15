import { createBrowserRouter, Navigate } from "react-router-dom"
import { RoleGuard, RootRedirect } from "@/components/auth/RoleGuard"
import { AppLayout } from "@/components/layout/AppLayout"
import FieldManagerLayout from "@/components/layout/FieldManagerLayout"
import CoachLayout from "@/components/layout/CoachLayout"
import AdminLayout from "@/components/layout/AdminLayout"
import { LoginPage } from "@/pages/LoginPage"
import { LandingPage } from "@/pages/LandingPage"
import { MatchDetailPage } from "@/pages/MatchDetailPage"
import { CourtCalendarPage } from "@/pages/CourtCalendarPage"
import { OwnerCourtsPage } from "@/pages/OwnerCourtsPage"
import { OwnerSettingsPage } from "@/pages/OwnerSettingsPage"
import { OwnerCoachesPage } from "@/pages/OwnerCoachesPage"
import { OwnerReportsPage } from "@/pages/OwnerReportsPage"
import { CoachDashboardPage } from "@/pages/CoachDashboardPage"
import { CoachCoursesPage } from "@/pages/CoachCoursesPage"
import { CoachAttendancePage } from "@/pages/CoachAttendancePage"
import { CoachVenuesPage } from "@/pages/CoachVenuesPage"
import { CoachProfilePage } from "@/pages/CoachProfilePage"
import { CoachWalletPage } from "@/pages/CoachWalletPage"
import { CoachDirectoryPage } from "@/pages/CoachDirectoryPage"
import { VenuesPage } from "@/pages/VenuesPage"
import { CheckInKioskPage } from "@/pages/CheckInKioskPage"
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { AdminKycPage } from "@/pages/admin/AdminKycPage"
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage"
import { AdminDisputesPage } from "@/pages/admin/AdminDisputesPage"
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage"

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: <RoleGuard allow={["player"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "player", element: <LandingPage /> },
          { path: "matches", element: <Navigate to="/matches/detail" replace /> },
          { path: "matches/detail", element: <MatchDetailPage /> },
          { path: "coaches", element: <CoachDirectoryPage /> },
          { path: "venues", element: <VenuesPage /> },
        ],
      },
    ],
  },
  {
    element: <RoleGuard allow={["coach"]} />,
    children: [
      {
        path: "/coach",
        element: <CoachLayout />,
        children: [
          { index: true, element: <Navigate to="schedule" replace /> },
          { path: "dashboard", element: <Navigate to="/coach/schedule" replace /> },
          { path: "schedule", element: <CoachDashboardPage /> },
          { path: "courses", element: <CoachCoursesPage /> },
          { path: "attendance", element: <CoachAttendancePage /> },
          { path: "venues", element: <CoachVenuesPage /> },
          { path: "profile", element: <CoachProfilePage /> },
          { path: "wallet", element: <CoachWalletPage /> },
        ],
      },
    ],
  },
  {
    element: <RoleGuard allow={["fm"]} />,
    children: [
      {
        path: "/fm",
        element: <FieldManagerLayout />,
        children: [
          { index: true, element: <Navigate to="calendar" replace /> },
          { path: "calendar", element: <CourtCalendarPage /> },
          { path: "courts", element: <OwnerCourtsPage /> },
          { path: "settings", element: <OwnerSettingsPage /> },
          { path: "coaches", element: <OwnerCoachesPage /> },
          { path: "reports", element: <OwnerReportsPage /> },
          { path: "checkin", element: <CheckInKioskPage /> },
        ],
      },
    ],
  },
  {
    element: <RoleGuard allow={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "kyc", element: <AdminKycPage /> },
          { path: "approvals", element: <Navigate to="/admin/kyc" replace /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "disputes", element: <AdminDisputesPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <RootRedirect /> },
])

