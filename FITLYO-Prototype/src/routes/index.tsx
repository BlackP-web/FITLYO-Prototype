import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { LandingPage } from "@/pages/LandingPage"
import { MatchFeedPage } from "@/pages/MatchFeedPage"
import { MatchDetailPage } from "@/pages/MatchDetailPage"
import { CourtCalendarPage } from "@/pages/CourtCalendarPage"
import { CoachDashboardPage } from "@/pages/CoachDashboardPage"
import { CoachDirectoryPage } from "@/pages/CoachDirectoryPage"
import { AdminApprovalsPage } from "@/pages/AdminApprovalsPage"
import { VenuesPage } from "@/pages/VenuesPage"
import { ProfileDuprPage } from "@/pages/ProfileDuprPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "matches", element: <MatchFeedPage /> },
      { path: "matches/detail", element: <MatchDetailPage /> },
      { path: "fm/calendar", element: <CourtCalendarPage /> },
      { path: "coach/dashboard", element: <CoachDashboardPage /> },
      { path: "coaches", element: <CoachDirectoryPage /> },
      { path: "admin/approvals", element: <AdminApprovalsPage /> },
      { path: "venues", element: <VenuesPage /> },
      { path: "profile", element: <ProfileDuprPage /> },
      // Fallback
      { path: "*", element: <MatchFeedPage /> },
    ],
  },
])
