import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { BottomBar } from "./BottomBar"
import { useFitlyoStore } from "@/store/useFitlyoStore"

export function AppLayout() {
  const activeRole = useFitlyoStore((state) => state.activeRole)
  const isFieldManager = activeRole === 'fm' || activeRole === 'field_manager'

  if (isFieldManager) {
    return <Navigate to="/fm/calendar" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomBar />
    </div>
  )
}
