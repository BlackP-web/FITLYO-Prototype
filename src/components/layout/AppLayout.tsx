import React from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { BottomBar } from "./BottomBar"
import { SupportChatWidget } from "@/components/support/SupportChatWidget"
import { WalletTopUpDialog } from "@/components/payment/WalletTopUpDialog"

export function AppLayout() {
  return (
    <div className="fitlyo-page-canvas min-h-screen text-foreground flex flex-col font-sans">
      <Header />
      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-12 md:pt-7 lg:px-12">
        <Outlet />
      </main>
      <BottomBar />
      <SupportChatWidget />
      <WalletTopUpDialog />
    </div>
  )
}
