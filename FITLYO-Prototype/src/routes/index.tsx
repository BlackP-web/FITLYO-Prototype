import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "matches/detail", element: <MatchDetailPage /> },
      { path: "coach/dashboard", element: <CoachDashboardPage /> },
      { path: "coaches", element: <CoachDirectoryPage /> },
      { path: "venues", element: <VenuesPage /> },
    ],
  },
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
])



