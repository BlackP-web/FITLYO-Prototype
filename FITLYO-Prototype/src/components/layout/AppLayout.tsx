import React from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { BottomBar } from "./BottomBar"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-10 md:pt-8 lg:px-10">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  )
}
