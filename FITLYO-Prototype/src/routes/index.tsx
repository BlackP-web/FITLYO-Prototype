import { createBrowserRouter, Navigate } from "react-router-dom"
import FieldManagerLayout from "@/components/layout/FieldManagerLayout"
import { LandingPage } from "@/pages/LandingPage"
import { SignInPage } from "@/pages/SignInPage"
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
import { CoachDirectoryPage } from "@/pages/CoachDirectoryPage"
import { VenuesPage } from "@/pages/VenuesPage"
import { CheckInKioskPage } from "@/pages/CheckInKioskPage"
import { ProfilePage } from "@/pages/ProfilePage"

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

  // Cổng điều hành dành cho Chủ sân (Field Manager)
  {
    path: "/fm",
    element: <FieldManagerLayout />,
    children: [
      { index: true, element: <Navigate to="/fm/calendar" replace /> },
      { path: "calendar", element: <CourtCalendarPage /> },
      { path: "courts", element: <OwnerCourtsPage /> },
      { path: "settings", element: <OwnerSettingsPage /> },
      { path: "coaches", element: <OwnerCoachesPage /> },
      { path: "reports", element: <OwnerReportsPage /> },
      { path: "checkin", element: <CheckInKioskPage /> },
    ],
  },

  // Fallback 404
  { path: "*", element: <Navigate to="/" replace /> },
])
