import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { useAppStore } from "@/store/useAppStore"

export function AppLayout() {
  const { fetchUserProfile, fetchWorkouts } = useAppStore()

  useEffect(() => {
    fetchUserProfile()
    fetchWorkouts()
  }, [fetchUserProfile, fetchWorkouts])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
