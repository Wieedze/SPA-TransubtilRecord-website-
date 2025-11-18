import { Outlet } from "react-router-dom"
import Navbar from "./Navbar.tsx"
import Footer from "./Footer.tsx"

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-900 text-white">
      <Navbar />
      <main className="flex-1 px-4 md:px-8 lg:px-16 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
