import { createBrowserRouter, Navigate } from "react-router-dom"
import { RoleGuard, RootRedirect } from "@/components/auth/RoleGuard"
import { AppLayout } from "@/components/layout/AppLayout"
import FieldManagerLayout from "@/components/layout/FieldManagerLayout"
import CoachLayout from "@/components/layout/CoachLayout"
import AdminLayout from "@/components/layout/AdminLayout"
import { LoginPage } from "@/pages/LoginPage"
import { LandingPage } from "@/pages/LandingPage"
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
import { PlayerHomePage } from "@/pages/player/PlayerHomePage"
import { MatchFeedPage } from "@/pages/player/MatchFeedPage"
import { PlayerMatchDetailPage } from "@/pages/player/MatchDetailPage"
import { MatchTicketPage } from "@/pages/player/MatchTicketPage"
import { MatchReviewPage } from "@/pages/player/MatchReviewPage"
import { VenueDiscoveryPage } from "@/pages/player/VenueDiscoveryPage"
import { VenueDetailPage } from "@/pages/player/VenueDetailPage"
import { PlayerProfilePage } from "@/pages/player/PlayerProfilePage"
import { VipMembershipPage } from "@/pages/player/VipMembershipPage"
import { PlayerSchedulePage } from "@/pages/player/PlayerSchedulePage"
import { PlayerCoachDetailPage } from "@/pages/player/PlayerCoachDetailPage"
import { PlayerCoachingPage } from "@/pages/player/PlayerCoachingPage"
import { CoachBookingsPage } from "@/pages/CoachBookingsPage"

export const router = createBrowserRouter([
  // SCR_PUB_01: Public Landing Page
  { path: "/", element: <LandingPage /> },

  // SCR_AUTH_01: Sign In
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/login", element: <LoginPage /> },

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
  { path: "/profile", element: <Navigate to="/player/profile" replace /> },

  // Role-based Layout Routes
  {
    element: <RoleGuard allow={["player"]} />,
    children: [
      {
        path: "/player",
        element: <AppLayout />,
        children: [
          { index: true, element: <PlayerHomePage /> },
          { path: "matches", element: <MatchFeedPage /> },
          { path: "matches/:matchId", element: <PlayerMatchDetailPage /> },
          { path: "matches/:matchId/ticket", element: <MatchTicketPage /> },
          { path: "matches/:matchId/review", element: <MatchReviewPage /> },
          { path: "venues", element: <VenueDiscoveryPage /> },
          { path: "venues/:venueId", element: <VenueDetailPage /> },
          { path: "coaches", element: <CoachDirectoryPage /> },
          { path: "coaches/:coachId", element: <PlayerCoachDetailPage /> },
          { path: "coaching", element: <PlayerCoachingPage /> },
          { path: "profile", element: <PlayerProfilePage /> },
          { path: "vip", element: <VipMembershipPage /> },
          { path: "schedule", element: <PlayerSchedulePage /> },
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
          { path: "bookings", element: <CoachBookingsPage /> },
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
