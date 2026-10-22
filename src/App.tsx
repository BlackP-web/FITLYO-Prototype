import { RouterProvider } from "react-router-dom"
import { router } from "@/routes"
import { LargeTextToggle } from "@/components/layout/LargeTextToggle"

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <LargeTextToggle />
    </>
  )
}
