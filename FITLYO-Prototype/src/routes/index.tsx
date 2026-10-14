import { createBrowserRouter, Navigate } from "react-router-dom"
import FieldManagerLayout from "@/components/layout/FieldManagerLayout"
import { LandingPage } from "@/pages/LandingPage"
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
  // Từng màn hình độc lập, tự quản lý UI không qua AppLayout chung
  { path: "/", element: <LandingPage /> },
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
