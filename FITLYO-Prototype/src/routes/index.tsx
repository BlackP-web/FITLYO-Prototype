import { createBrowserRouter, Navigate } from "react-router-dom"
import { RoleGuard, RootRedirect } from "@/components/auth/RoleGuard"
import { AppLayout } from "@/components/layout/AppLayout"
import FieldManagerLayout from "@/components/layout/FieldManagerLayout"
import CoachLayout from "@/components/layout/CoachLayout"
import AdminLayout from "@/components/layout/AdminLayout"
import { LoginPage } from "@/pages/LoginPage"
import { LandingPage } from "@/pages/LandingPage"
import { SignInPage } from "@/pages/SignInPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { SCR_AUTH_02 } from "@/pages/SCR_AUTH_02"
import { SCR_AUTH_03 } from "@/pages/SCR_AUTH_03"
import { SCR_AUTH_04 } from "@/pages/SCR_AUTH_04"
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
  // SCR_PUB_01: Public Landing Page
  { path: "/", element: <LandingPage /> },

  // SCR_AUTH_01: Sign In
  { path: "/login", element: <SignInPage /> },
  { path: "/auth/login", element: <SignInPage /> },

  // SCR_AUTH_02: Sign Up (Đăng ký thành viên)
  { path: "/auth/register", element: <SCR_AUTH_02 /> },
  { path: "/signup", element: <SCR_AUTH_02 /> },

  // SCR_AUTH_03: Phone OTP Verification (Xác thực mã OTP 6 số)
  { path: "/auth/verify-otp", element: <SCR_AUTH_03 /> },

  // SCR_AUTH_04: Initial Skill Survey & DUPR Seed (Khảo sát trình độ & Cấp DUPR ban đầu)
  { path: "/auth/dupr-survey", element: <SCR_AUTH_04 /> },
  { path: "/auth/verify-account", element: <SCR_AUTH_04 /> },

  // Player / User Matches & Venues
  { path: "/matches", element: <Navigate to="/matches/detail" replace /> },
  { path: "/matches/detail", element: <MatchDetailPage /> },
  { path: "/venues", element: <VenuesPage /> },
  { path: "/coaches", element: <CoachDirectoryPage /> },
  { path: "/coach/dashboard", element: <CoachDashboardPage /> },
  { path: "/profile", element: <ProfilePage /> },

  // Role-based Layout Routes
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