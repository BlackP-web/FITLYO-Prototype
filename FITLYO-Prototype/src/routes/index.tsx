import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardPage } from "@/pages/DashboardPage"
import { WorkoutsPage } from "@/pages/WorkoutsPage"
import { CreateWorkoutPage } from "@/pages/CreateWorkoutPage"
import { NutritionPage } from "@/pages/NutritionPage"
import { ProgressPage } from "@/pages/ProgressPage"
import { SchedulePage } from "@/pages/SchedulePage"
import { CommunityPage } from "@/pages/CommunityPage"
import { TrainersPage } from "@/pages/TrainersPage"
import { StorePage } from "@/pages/StorePage"
import { ReportsPage } from "@/pages/ReportsPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { SettingsPage } from "@/pages/SettingsPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "workouts", element: <WorkoutsPage /> },
      { path: "workouts/create", element: <CreateWorkoutPage /> },
      { path: "nutrition", element: <NutritionPage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "community", element: <CommunityPage /> },
      { path: "trainers", element: <TrainersPage /> },
      { path: "store", element: <StorePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
])
